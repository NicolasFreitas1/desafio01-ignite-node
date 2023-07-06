import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );
      if (tasks.length === 0)
        return res.writeHead(404).end(
          JSON.stringify({
            error: "Não foi possível encontrar tarefas de acordo com o filtro",
          })
        );
      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title || !description)
        return res
          .writeHead(400)
          .end(JSON.stringify({ error: "Titulo ou descrição vazio" }));

      const tasks = {
        id: randomUUID(),
        title,
        description,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: null,
      };

      database.insert("tasks", tasks);

      res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title && !description)
        return res
          .writeHead(400)
          .end(JSON.stringify({ error: "Titulo ou descrição vazio" }));

      const [task] = database.select("tasks", { id });

      if (!task) {
        return res.writeHead(404).end();
      }

      database.update("tasks", id, {
        title,
        description,
        updatedAt: new Date(),
      });
      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select("tasks", { id });

      if (!task) {
        return res.writeHead(404).end();
      }

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select("tasks", { id });

      if (!task) {
        return res.writeHead(404).end();
      }

      const isTaskCompleted = !!task.completedAt;

      const completedAt = isTaskCompleted ? null : new Date();

      database.update("tasks", id, { completedAt });

      return res.writeHead(204).end();
    },
  },
];
