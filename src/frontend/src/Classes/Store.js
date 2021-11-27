import React from "react";

export default class Store {
	_listeners = new Set;

	constructor(dispatcher, actionHandlers) {
		this._dispatcher = dispatcher;

		if (typeof (actionHandlers) === "object") {
			for (const event in actionHandlers) {
				dispatcher.subscribe(event, action => {
					actionHandlers[event]?.(action) !== false && this.emitChange();
				});
			}
		}

		this._actionHandlers = actionHandlers;
	}

	/**
	 * Forcefully emit an empty change.
	 */
	emitChange() {
		// @ts-ignore
		for (const listener of this._listeners) {
			listener();
		}
	}

	/**
	 * Attach a listener to the store.
	 * @param {Function} listener 
	 * @returns {Set}
	 */
	addListener(listener) {
		return this._listeners.add(listener);
	}

	/**
	 * Detach a listener from the store.
	 * @param {Function} listener 
	 * @returns {boolean}
	 */
	removeListener(listener) {
		return this._listeners.delete(listener);
	}

	get useState() {
		return (factory = _ => _, deps = []) => {
			const [state, setState] = React.useState(factory(this));

			React.useEffect(() => {
				const handleChange = () => setState(factory(this));

				this.addListener(handleChange);

				return () => void this.removeListener(handleChange);
			}, [state, ...deps]);

			return state;
		};
	}
}