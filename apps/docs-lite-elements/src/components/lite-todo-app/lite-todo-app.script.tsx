import {
  LiteElement,
  WithKita,
  customElement,
  onEvent,
  querySelector,
  reactiveAttribute,
} from '@eco-pages/lite-elements';
import { type LiteContext, createContext } from './context-provider';
import { consumeContext, contextSelector, provideContext } from './decorators';

export type LiteTodoAppProps = {
  count?: number;
};

export type LiteTodoProps = {
  complete?: boolean;
};

type TodoContext = {
  todos: {
    id: string;
    text: string;
    complete: boolean;
  }[];
  count: number;
};

export const todoContext = createContext<TodoContext>(Symbol('todo-context'));

@customElement('lite-todo-item')
export class LiteTodo extends WithKita(LiteElement) {
  @querySelector('input[type="checkbox"]') checkbox!: HTMLElement;
  @reactiveAttribute({ type: Boolean, reflect: true }) complete = false;
  @consumeContext(todoContext) context!: LiteContext<typeof todoContext>;

  @onEvent({ target: 'input[type="checkbox"]', type: 'change' })
  toggleComplete(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    console.log(this.context);
    const todo = this.context.getContext().todos.find((t) => t.id === this.id);
    if (!todo) return;
    todo.complete = checkbox.checked;
    this.complete = checkbox.checked;
  }
}

@customElement('lite-todo-app')
export class LiteTodos extends WithKita(LiteElement) {
  @querySelector('[data-count]') countText!: HTMLElement;
  @querySelector('[data-todo-list]') todoList!: HTMLElement;

  @provideContext({
    context: todoContext,
    initialValue: {
      todos: [],
      count: 0,
    },
  })
  provider!: LiteContext<typeof todoContext>;

  override connectedCallback(): void {
    super.connectedCallback();
    this.onCountUpdated = this.onCountUpdated.bind(this);
    this.onTodosUpdated = this.onTodosUpdated.bind(this);
    // this.provider.subscribe({ select: 'count', callback: this.onCountUpdated });
    // this.provider.subscribe({ select: 'todos', callback: this.onTodosUpdated });
  }

  @onEvent({ target: '[data-todo-form]', type: 'submit' })
  submitTodo(event: FormDataEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const todo = formData.get('todo');

    if (todo) {
      const prevTodos = this.provider.getContext().todos;
      const todos = [...prevTodos, { id: Date.now().toString(), text: todo.toString(), complete: false }];
      this.provider.setContext({ todos, count: todos.length });
      form.reset();
    }
  }

  @contextSelector({ context: todoContext, select: 'count' })
  onCountUpdated({ count }: Pick<TodoContext, 'count'>) {
    this.countText.textContent = count.toString();
  }

  @contextSelector({ context: todoContext, select: 'todos' })
  onTodosUpdated({ todos }: Pick<TodoContext, 'todos'>) {
    const latestTodo = todos.at(-1);
    if (!latestTodo) return;
    this.renderTemplate({
      target: this.todoList,
      template: (
        <lite-todo-item complete={false} class="todo-item" id={latestTodo.id}>
          {latestTodo.text as 'safe'}
          <span>
            <input type="checkbox" checked={latestTodo.complete} />
          </span>
        </lite-todo-item>
      ),
      insert: todos.length === 1 ? 'replace' : 'beforeend',
    });
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lite-todo-app': HtmlTag & LiteTodoAppProps;
      'lite-todo-item': HtmlTag & LiteTodoProps;
    }
  }
}
