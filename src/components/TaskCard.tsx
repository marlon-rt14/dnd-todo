import React, { useState } from "react";
import { Id, Task } from "../types";
import { TrashIcon } from "../icons/TrashIcon";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
}

export const TaskCard = ({ task, deleteTask, updateTask }: Props) => {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toogleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
        opacity-50
bg-mainBackgroundColor
p-2.5 
min-h-[100px]
flex
items-center
text-left
rounded-xl
border-2
border-rose-500
cursor-grab
relative
"
      />
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="
bg-mainBackgroundColor
p-2.5 
h-[100px]
min-h-[100px]
flex
items-center
text-left
rounded-xl
hover:ring-2
hover:ring-inset
hover:ring-rose-500
cursor-grab
relative
"
      >
        <textarea
          value={task.content}
          autoFocus
          placeholder="Task content here"
          onBlur={toogleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) toogleEditMode();
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
          className="h-[90%] w-full resize-none border-none rounded
        bg-transparent text-white focus:outline-none"
        ></textarea>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      onClick={toogleEditMode}
      className="
  bg-mainBackgroundColor
  p-2.5 
  h-[100px]
  min-h-[100px]
  flex
  items-center
  text-left
  rounded-xl
  hover:ring-2
  hover:ring-inset
  hover:ring-rose-500
  cursor-grab
  relative
  task
  "
    >
      <p className="my-auto h-[90%] w-full overflow-x-hidden overflow-y-auto whitespace-pre-wrap">{task.content}</p>
      {mouseIsOver && (
        <button
          onClick={() => deleteTask(task.id)}
          className="
      stroke-red-500
      absolute
      right-4
      top-1/2
      -translate-y-1/2
      bg-columnBackgroundColor
      p-2 
      rounded-xl
      opacity-60
      hover:opacity-100
      "
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
};
