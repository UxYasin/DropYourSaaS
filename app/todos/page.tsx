import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from("todos").select();

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Supabase Test (Todos)</h1>
      {error && <p className="text-red-500 text-sm">Error fetching todos: {error.message}</p>}
      <ul className="list-disc pl-5 space-y-1">
        {todos?.map((todo: any) => (
          <li key={todo.id}>{todo.name || todo.title || JSON.stringify(todo)}</li>
        ))}
      </ul>
      {(!todos || todos.length === 0) && !error && (
        <p className="text-muted-foreground text-sm">No todos found or table is empty.</p>
      )}
    </div>
  );
}
