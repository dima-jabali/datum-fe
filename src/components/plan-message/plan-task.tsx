import { Plus, X } from "lucide-react";

import type { BotPlanStepId, PlanStep } from "#/types/chat";
import { useTasks } from "#/components/plan-message/use-tasks-context";
import {
	getTaskString,
	validatePlanInPlace,
} from "#/components/plan-message/utils";
import { createISODate } from "#/lib/utils";
import { Checkbox } from "#/components/ui/checkbox";

type TaskProps = {
	taskId: number;
};

function hasNestedTasks(task: PlanStep) {
	return (
		task &&
		"sub_tasks" in task &&
		task.sub_tasks &&
		Array.isArray(task.sub_tasks) &&
		task.sub_tasks.length > 0 &&
		task.sub_tasks.some((task) => task.is_active)
	);
}

function getTaskRef(
	tasks: PlanStep[],
	id: number,
): { task: PlanStep | null; index: number } {
	let index = 0;

	for (const task of tasks) {
		if (task.id === id) {
			return { task, index };
		}

		// If the current object has sub tasks, recurse through them:
		if (task.sub_tasks && task.sub_tasks.length > 0) {
			const item = getTaskRef(task.sub_tasks, id);

			if (item.task) {
				return item;
			}
		}

		++index;
	}

	return { task: null, index: -1 };
}

export function Task({ taskId }: TaskProps) {
	const { tasksRef, forceRender, isEditing } = useTasks();

	const { task, index } = getTaskRef(tasksRef.current, taskId);

	if (!task) {
		console.error("Task not found! This should never happen!", {
			tasksRef,
			taskId,
		});

		return null;
	}

	if (!task.is_active) {
		return null;
	}

	const { task: parentTask, index: _parentIndex } = Number.isFinite(
		task.parent_step.id || undefined,
	)
		? getTaskRef(tasksRef.current, task.parent_step.id!)
		: { task: null, index: -1 };

	const taskString = getTaskString(task);
	const isTaskCompleted = (() => {
		// If a task that is below this one has `is_current_task` set to true, then this task is completed:

		let indexOfTaskThatHasIsCurrentSetToTrue;

		// Let's look for the `is_current_task` set to true:
		if (!parentTask) {
			indexOfTaskThatHasIsCurrentSetToTrue = tasksRef.current.findIndex(
				(t) => t.is_current_task,
			);
		} else {
			indexOfTaskThatHasIsCurrentSetToTrue = parentTask.sub_tasks?.findIndex(
				(t) => t.is_current_task,
			);
		}

		if (!indexOfTaskThatHasIsCurrentSetToTrue) return false;

		// Now, if the index of this task is smaller than the index of the `is_current_task` set to true, then this task must be considered as complete:
		return index < indexOfTaskThatHasIsCurrentSetToTrue;
	})();

	const handleTaskChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
		const textarea = e.target as HTMLTextAreaElement;

		task.task = textarea.value;
	};

	const handleDeleteTask = () => {
		task.is_active = false;

		validatePlanInPlace(tasksRef.current);

		forceRender();
	};

	const handleAddSubTask = () => {
		if (!task.sub_tasks) {
			task.sub_tasks = [];
		}

		const now = createISODate();

		task.sub_tasks.push({
			bot_conversation: task.bot_conversation,
			parent_step: { id: task.id ?? null },
			id: Date.now() as BotPlanStepId,
			plan_uuid: task.plan_uuid,
			is_current_task: false,
			step_num: index + 1,
			created_at: now,
			updated_at: now,
			is_active: true,
			is_root: false,
			task: "",
		});

		validatePlanInPlace(tasksRef.current);

		forceRender();
	};

	const handleAddTaskBelow = () => {
		if (task.parent_step.id === null) {
			// Add at the top level:

			const isLastTask = index === tasksRef.current.length - 1;
			const now = createISODate();

			const newTaskAtRoot: PlanStep = {
				bot_conversation: task.bot_conversation,
				id: Date.now() as BotPlanStepId,
				parent_step: { id: null },
				plan_uuid: task.plan_uuid,
				is_current_task: false,
				step_num: index + 1,
				updated_at: now,
				created_at: now,
				is_active: true,
				is_root: true,
				task: "",
			};

			if (isLastTask) {
				tasksRef.current.push(newTaskAtRoot);
			} else {
				tasksRef.current.splice(index + 1, 0, newTaskAtRoot);
			}
		} else if (parentTask) {
			if (!parentTask.sub_tasks) {
				parentTask.sub_tasks = [];
			}

			const isLastTask = index === parentTask.sub_tasks.length - 1;
			const now = createISODate();

			const newSubTask: PlanStep = {
				bot_conversation: task.bot_conversation,
				parent_step: { id: parentTask.id },
				id: Date.now() as BotPlanStepId,
				plan_uuid: task.plan_uuid,
				is_current_task: false,
				step_num: index + 1,
				updated_at: now,
				created_at: now,
				is_active: true,
				is_root: false,
				task: "",
			};

			if (isLastTask) {
				parentTask.sub_tasks.push(newSubTask);
			} else {
				parentTask.sub_tasks.splice(index + 1, 0, newSubTask);
			}
		}

		validatePlanInPlace(tasksRef.current);

		forceRender();
	};

	const handleSetIsCurrentTask = () => {
		if (task.parent_step.id === null) {
			// Is at the top level.

			tasksRef.current.forEach((task) => {
				task.is_current_task = false;
			});
		} else if (parentTask) {
			if (!parentTask.sub_tasks) {
				parentTask.sub_tasks = [];
			}

			parentTask.sub_tasks.forEach((subTask) => {
				subTask.is_current_task = false;
			});
		}

		task.is_current_task = true;

		forceRender();
	};

	return (
		<article
			className="rounded-lg border-2 data-[is-active=true]:border-green-400/50 border-blue-400/50 p-4 text-sm relative data-[is-completed=true]:opacity-55 data-[is-completed=true]:pointer-events-none data-[is-completed=true]:border-yellow-400/50"
			data-is-active={task.is_current_task}
			data-is-completed={isTaskCompleted}
		>
			{task.is_current_task || isTaskCompleted ? (
				<span
					className="text-positive data-[is-complete=true]:text-warning font-medium text-xs absolute -top-3 p-1 px-2 rounded-full left-2 bg-popover"
					data-is-complete={isTaskCompleted}
				>
					{isTaskCompleted ? "Task Complete" : "Current Task"}
				</span>
			) : null}

			{isEditing ? (
				<div className="bg-popover flex flex-none absolute bottom-[-13px] left-[calc(50%-12px)] rounded-full">
					<button
						className="bg-popover flex flex-none p-1 rounded-full button-hover"
						onClick={handleAddTaskBelow}
						title="Add task below"
					>
						<Plus className="size-4" />
					</button>
				</div>
			) : null}

			<div className="flex w-full items-center justify-between gap-2 ">
				<div className="flex items-start">
					<Counter />

					<textarea
						className="simple-scrollbar min-h-8 w-96 mobile:w-full mobile:min-w-32 rounded-lg data-[is-editing=true]:p-2 border-border-smooth border-none data-[is-editing=true]:border-solid border-2 bg-transparent field-sizing-content text-xs"
						title={isEditing ? "Edit task" : undefined}
						onChange={handleTaskChange}
						data-is-editing={isEditing}
						defaultValue={taskString}
						disabled={!isEditing}
					/>
				</div>

				{isEditing ? (
					<button
						className="rounded-full p-1 bg-destructive/40 hover:bg-destructive/60 active:bg-destructive/80 data-[is-deleted=true]:bg-yellow-400 data-[is-deleted=true]:active:bg-yellow-800 onfocus:data-[is-deleted=true]:bg-yellow-600"
						onClick={handleDeleteTask}
						title="Delete task"
					>
						<X className="size-4 text-primary" />
					</button>
				) : null}
			</div>

			<footer className="mt-3 flex flex-col w-full gap-3">
				{isEditing ? (
					<div className="flex w-full items-center justify-between gap-3">
						<label className="flex gap-2 pointer-events-auto items-center">
							<Checkbox
								onCheckedChange={handleSetIsCurrentTask}
								defaultChecked={task.is_current_task}
							/>

							<span className="text-xs">Is current task</span>
						</label>

						<div className="flex gap-4 items-center">
							<button
								className="hover:underline text-xs font-normal"
								onClick={handleAddSubTask}
								title="Add nested task"
							>
								Add sub task
							</button>
						</div>
					</div>
				) : null}

				<div>
					{hasNestedTasks(task) ? (
						<details open>
							<summary className="cursor-pointer onfocus:underline text-xs">
								Nested tasks
							</summary>

							<div
								className="mt-3 data-[is-editing=true]:my-3 flex flex-col gap-4 [counter-reset:index]"
								data-is-editing={isEditing}
							>
								{task.sub_tasks?.map((task) => (
									// eslint-disable-next-line react-hooks/purity
									<Task key={Math.random()} taskId={task.id} />
								))}
							</div>
						</details>
					) : null}
				</div>
			</footer>
		</article>
	);
}

function Counter() {
	return <span className="bot-plan-counter mr-2 font-bold select-none"></span>;
}
