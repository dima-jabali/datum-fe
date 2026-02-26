import {
	createContext,
	useContext,
	useLayoutEffect,
	useRef,
	useState,
} from "react";

import { PlanApprovalStatus, type PlanStep } from "#/types/chat";
import { useFetchBotPlan } from "#/hooks/get/use-fetch-bot-plan";
import { useForceRender } from "#/hooks/use-force-render";

type TasksContextData = {
	tasksRef: React.RefObject<PlanStep[]>;
	isEditing: boolean;
	setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
	forceRender: React.DispatchWithoutAction;
};

const TasksContext = createContext<TasksContextData | null>(null);

export function TasksProvider({ children }: React.PropsWithChildren) {
	const activePlan = useFetchBotPlan().data;
	const forceRender = useForceRender();

	const [isEditing, setIsEditing] = useState(false);

	const tasksRef = useRef(structuredClone(activePlan?.sub_tasks) ?? []);

	useLayoutEffect(() => {
		setIsEditing(activePlan?.approval_status === PlanApprovalStatus.Pending);

		tasksRef.current = structuredClone(activePlan?.sub_tasks) ?? [];

		forceRender();
	}, [activePlan, tasksRef, forceRender]);

	return (
		<TasksContext.Provider
			value={{
				isEditing,
				tasksRef,
				setIsEditing,
				forceRender,
			}}
		>
			{children}
		</TasksContext.Provider>
	);
}

export function useTasks(): TasksContextData {
	const ctx = useContext(TasksContext);

	if (!ctx) {
		throw new Error("useTasks must be used within a TasksProvider");
	}

	return ctx;
}
