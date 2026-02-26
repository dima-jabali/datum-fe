import {
	type ChildFilter,
	type Filter,
	type FilterGroup,
	FilterOperator,
} from "#/components/table-for-block/filters/utilityTypes";

type HasChanged = boolean;

export function modifyChildFilter<
	KeyToModify extends keyof ChildFilter,
	NewValue extends ChildFilter[KeyToModify],
>(
	parentFilter: FilterGroup,
	filterToBeModified: ChildFilter,
	keyToModify: KeyToModify,
	newValue: NewValue,
): HasChanged {
	let hasChanged = false;

	for (const filter of parentFilter.children) {
		if (hasChanged) break;

		const isFilterToBeModified = filter === filterToBeModified;

		if (isFilterToBeModified) {
			filter[keyToModify] = newValue;
			hasChanged = true;

			break;
		}

		if (isAParent(filter)) {
			hasChanged = modifyChildFilter(
				filter,
				filterToBeModified,
				keyToModify,
				newValue,
			);
		}
	}

	return hasChanged;
}

export function withFilter(
	parentFilter: FilterGroup,
	filterToAdd: Filter,
	filterAbove?: Filter,
): HasChanged {
	if (!filterToAdd.parent) {
		console.error("filterToAdd.parent is undefined");

		return false;
	}

	const shouldAddAtOutermostParent = filterToAdd.parent === parentFilter;

	if (shouldAddAtOutermostParent) {
		if (filterAbove) {
			const innerIndex = parentFilter.children.indexOf(filterAbove);

			if (innerIndex !== -1) {
				parentFilter.children.splice(innerIndex + 1, 0, filterToAdd);
			}
		} else {
			parentFilter.children.push(filterToAdd);
		}

		return true;
	}

	let hasAdded = false;

	for (const filter of parentFilter.children) {
		if (hasAdded) break;

		if (isAParent(filter)) {
			const isTheParentOfTheNewFilter = filter === filterToAdd.parent;

			if (isTheParentOfTheNewFilter) {
				const innerIndex = filter.children.findIndex((f) => f === filterAbove);

				if (innerIndex === -1) {
					filter.children.push(filterToAdd);
					hasAdded = true;
				} else {
					filter.children.splice(innerIndex + 1, 0, filterToAdd);
					hasAdded = true;
				}
			} else {
				hasAdded = withFilter(filter, filterToAdd, filterAbove);
			}
		}
	}

	return hasAdded;
}

export function withoutFilter(
	parentFilter: FilterGroup,
	filterToRemove: Filter,
): HasChanged {
	let hasRemoved = false;
	let index = 0;

	const isOutermostFilter = filterToRemove === parentFilter;

	if (isOutermostFilter) {
		// @ts-expect-error => We want to delete it.
		parentFilter = undefined;

		return true;
	}

	if (filterToRemove.parent === parentFilter) {
		const index = parentFilter.children.findIndex((f) => f === filterToRemove);

		if (index !== -1) {
			parentFilter.children.splice(index, 1);
		}

		return true;
	}

	for (const filter of parentFilter.children) {
		if (hasRemoved) break;

		if (isAParent(filter)) {
			const isParentOfFilterToDelete = filter === filterToRemove.parent;

			if (isParentOfFilterToDelete) {
				filter.children.splice(index, 1);

				hasRemoved = true;
			}

			hasRemoved = withoutFilter(filter, filterToRemove);
		} else {
			const isFilterToDelete = filter === filterToRemove;

			if (isFilterToDelete) {
				parentFilter.children.splice(index, 1);
				hasRemoved = true;
			}
		}

		++index;
	}

	return hasRemoved;
}

/** Change if it's with AND or OR */
export function withFilterOperator(
	parentFilter: FilterGroup,
	newFilterOperator: FilterOperator,
	filterToBeModified: Filter,
): HasChanged {
	if (!filterToBeModified.parent) {
		console.error("filterToAdd.parent is undefined");

		return false;
	}

	if (filterToBeModified.parent === parentFilter) {
		parentFilter.filterOperator = newFilterOperator;

		return true;
	}

	let hasChanged = false;

	for (const filter of parentFilter.children) {
		if (hasChanged) break;

		if (isAParent(filter)) {
			const isParentFilterToBeModified = filter === filterToBeModified.parent;

			if (isParentFilterToBeModified) {
				filter.filterOperator = newFilterOperator;
				hasChanged = true;

				break;
			}

			hasChanged = withFilterOperator(
				filter,
				newFilterOperator,
				filterToBeModified,
			);
		}
	}

	return hasChanged;
}

export function isAParent(filter: Filter): filter is FilterGroup {
	// @ts-expect-error => if `filter.children` is undefined (does not exist), it will return false.
	return Array.isArray(filter.children);
}
