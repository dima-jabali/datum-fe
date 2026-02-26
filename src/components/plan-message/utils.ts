import type { PlanStep } from "#/types/chat";

export function getTaskString(task: PlanStep) {
	return task && "task" in task && typeof task.task === "string"
		? task.task
		: "";
}

export function validatePlanInPlace(
	tasks: PlanStep[],
	/** From here on, params are only used internally for recursion: */
	shouldSetAllTasksIsCurrentTaskToFalse = false,
): PlanStep[] {
	// Exactly one (sub_)task at each level has to have `is_current_task = true`
	// if its parent task has `is_current_task = true`

	let currentTask: PlanStep | null = null;

	for (const task of tasks) {
		if (!task.is_active) continue;

		if (task.is_current_task) {
			if (shouldSetAllTasksIsCurrentTaskToFalse) {
				task.is_current_task = false;

				// Set all its sub tasks to false too:
				if (task.sub_tasks && task.sub_tasks.length > 0) {
					validatePlanInPlace(task.sub_tasks, true);
				}

				continue;
			} else if (currentTask) {
				// There already is a current task at this level,
				// so we can't add another one:

				task.is_current_task = false;

				// Set all its sub tasks to false too:
				if (task.sub_tasks && task.sub_tasks.length > 0) {
					validatePlanInPlace(task.sub_tasks, true);
				}

				continue;
			} else {
				currentTask = task;

				// Exactly one of its sub_tasks must be set to true.
				if (task.sub_tasks && task.sub_tasks.length > 0) {
					validatePlanInPlace(task.sub_tasks, true);

					continue;
				}
			}
		}
	}

	if (!currentTask) {
		for (const task of tasks) {
			if (!task.is_active) continue;

			task.is_current_task = true;

			if (task.sub_tasks && task.sub_tasks.length > 0) {
				validatePlanInPlace(task.sub_tasks);
			}

			break;
		}
	}

	return tasks;
}
