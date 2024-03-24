import React, { useMemo, useState } from "react";
import { PlusIcon } from "../icons/PlusIcon";
import { Column, Id, Task } from "../types";
import { ColumnContainer } from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { TaskCard } from "./TaskCard";

const generateId = () => {
  // Geerate a random number between 0 and 1000
  return Math.floor(Math.random() * 1001);
};

export const Board = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  // TASKS
  const [tasks, setTasks] = useState<Task[]>([]);

  // DRAG STATES
  // Cuando comenzamos a arrastrar este estado tendra el valor de la columna,
  // caso contrario sera nulo. Es decir que no se estara arrastrando nada
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // necesitamos mover nuestra Columna 300px para que comience en evenDratStart
        distance: 3, // 300px
      },
    })
  );

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  };

  const deleteColumn = (id: Id) => {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    // Eliminar las tareas de la columna que estamos eliminando
    const newTasks = tasks.filter((task) => task.columnId !== id);
    setTasks(newTasks);
  };

  const updateColumn = (id: Id, title: string) => {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumns(newColumns);
  };

  // DRAG FUNCTIONS
  const onDragStart = (evt: DragStartEvent) => {
    if (evt.active.data.current?.type === "Column") {
      setActiveColumn(evt.active.data.current.column);
      return;
    }

    if (evt.active.data.current?.type === "Task") {
      setActiveTask(evt.active.data.current.task);
      return;
    }
  };

  const onDragEnd = (evt: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = evt;
    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeColumnId);
      const overColumnIndex = columns.findIndex((col) => col.id === overColumnId);

      // Lo que esta haciendo es intercambiar las posiciones entre activeColumnIndex
      // y overColumnIndex. Y retornando el nuevo array
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  const onDragOver = (evt: DragOverEvent) => {
    // Escenario de no hacer ningun movimiento cuando no esta sobre ningun otro elemento
    // o cuando el elemento activo este sobre el mismo elemento
    const { active, over } = evt;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Verificar si el elemento activo y el elemento de encima son tareas
    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Cuando estamos soltando una Tarea sobre otra Tarea
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Cuando estamos soltando una Tarea sobre otra columna
    const isOverAColumn = over.data.current?.type === "Column";

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  // TASK FUNCTIONS
  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length}`,
    };

    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: Id) => {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  };

  const updateTask = (id: Id, content: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      else return { ...task, content };
    });
    setTasks(newTasks);
  };

  return (
    <div
      className="
    m-auto
    flex
    min-h-screen
    w-full
    items-center
    overflow-x-auto
    overflow-y-hidden
    px-[40px]
    "
    >
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <div className="m-auto flex gap-4">
          <div className="flex gap-2">
            <SortableContext items={columnsId}>
              {/* Usando como key el 'ind', se hace un efecto en el dragEnd, */}
              {/* de que el viejo elemento vuelve a su primera posicion para luego cambiarse  */}
              {/* a la nueva posicion. */}
              {columns.map((col, ind) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  // Tasks
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={createNewColumn}
            className="
        h-[60px] 
        w-[350px] 
        min-w-[350px]
        cursor-pointer
        rounded-lg
        bg-mainBackgroundColor
        border-2
        border-columnBackgroundColor
        p-4
        ring-rose-500
        hover:ring-2
        flex
        gap-2
        "
          >
            <PlusIcon />
            Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                // Tasks
                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
            {activeTask && <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />}
          </DragOverlay>,
          // decimos que queremos poner nuestro elemento dentro del body,
          document.body
        )}
      </DndContext>
    </div>
  );
};
