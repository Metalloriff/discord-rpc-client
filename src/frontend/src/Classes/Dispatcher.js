import _ from "lodash";
import React from "react";

export default class Dispatcher {
	_callbacks = {};

	subscribe(event, callback) {
		if (!this._callbacks[event]) {
			this._callbacks[event] = new Set;
		}

		this._callbacks[event].add(callback);

		return this.unsubscribe.bind(this, event, callback);
	}

	unsubscribe(event, callback) {
		if (!this._callbacks[event]) return;

		this._callbacks[event].delete(callback);
	}

	dispatch(action) {
		const event = action.type;
		if (!this._callbacks[event]) return;

		for (const listener of this._callbacks[event]) {
			listener(action);
		}
	}

	get useForceUpdater() {
		return (actionType, condition = null, deps = [], options = {}) => {
			let [, forceUpdate] = React.useReducer(x => x + 1, 0);

			if (typeof (options.debounce) === "number") {
				forceUpdate = _.debounce(forceUpdate, options.debounce);
			}

			React.useEffect(() => {
				return this.subscribe(actionType, data => {
					if (typeof (condition) === "function") {
						if (condition(data)) {
							forceUpdate();
						}
					}
					else forceUpdate();
				});
			}, deps);
		};
	}
}

export const dispatcher = new Dispatcher;