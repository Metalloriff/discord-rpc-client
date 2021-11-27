import { ActionTypes } from "../Constants";
import { dispatcher } from "../Dispatcher";
import Store from "../Store";

const useHash = false;

function getCurrent() {
	return useHash
		? window.location.hash
		: window.location.pathname;
}

const RoutesStoreClass = class RoutesStore extends Store {
	constructor(dispatcher, actionHandlers) {
		super(dispatcher, actionHandlers);

		window.addEventListener("popstate", () => {
			dispatcher.dispatch({
				type: ActionTypes.UPDATE_PAGE
			});
		});
	}

	getCurrentRoute() {
		return getCurrent();
	}

	getFormattedRoute() {
		return getCurrent().split("?")[0].split("/").filter(p => p && p !== "#");
	}

	static formatUri(uri) {
		if (useHash) {
			if (!uri.startsWith("#")) {
				uri = "#" + uri;
			}
		}

		return uri;
	}
}

const RoutesStore = new RoutesStoreClass(dispatcher, {
	[ActionTypes.UPDATE_ROUTE]: ({ path, replace = false }) => {
		path = RoutesStoreClass.formatUri(path);

		window.history[replace ? "replaceState" : "pushState"](
			{ last: getCurrent(), lastTime: Date.now() },
			null,
			path
		);

		dispatcher.dispatch({
			type: ActionTypes.UPDATE_PAGE
		});
	},
	[ActionTypes.UPDATE_PAGE]: () => { }
});

export default RoutesStore;