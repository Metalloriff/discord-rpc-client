import React from "react";
import "./App.scss";
import DetailsExample from "./Assets/DetailsExample.png";
import LargeImageExample from "./Assets/LargePictureExample.png";
import SmallImageExample from "./Assets/SmallPictureExample.png";
import StateExample from "./Assets/StateExample.png";
import SwitchItem from "./Components/SwitchItem";

const fs = window.require("fs");
let config = JSON.parse(
	fs.existsSync("./config.json")
		? fs.readFileSync("./config.json", "utf8")
		: JSON.stringify({
			applicationId: "913866110695264306",
			details: "Details Example",
			state: "State Example",
			largeImageKey: "example_icon",
			largeImageText: "Example Large Image Text",
			smallImageKey: "example_icon",
			smallImageText: "Example Small Image Text",
			autoStart: true
		})
);


const fields = {
	applicationId: {
		title: "Application ID",
		description: "This will be in your application after creating one in the developer portal. (at the bottom)",
		placeholder: "Example: 913866110695264306",
		value: config.applicationId || ""
	},
	details: {
		title: "Details",
		description: "The first field, directly under the application name.",
		value: config.details || "",
		image: DetailsExample
	},
	state: {
		title: "State",
		description: "The second field, under details.",
		value: config.state || "",
		image: StateExample
	},
	largeImageKey: {
		title: "Large Image Key",
		description: "The key of the image to use for the large image section. This must match an image key in the developer portal app.",
		value: config.largeImageKey || "",
		image: LargeImageExample
	},
	largeImageText: {
		title: "Large Image Text",
		description: "The text to use for the tooltip of the large image.",
		value: config.largeImageText || ""
	},
	smallImageKey: {
		title: "Small Image Key",
		description: "The key of the image to use for the small image section. This must match an image key in the developer portal app.",
		value: config.smallImageKey || "",
		image: SmallImageExample
	},
	smallImageText: {
		title: "Small Image Text",
		description: "The text to use for the tooltip of the small image.",
		value: config.smallImageText || ""
	},
	startTimestamp: {
		title: "Start Timestamp",
		description: "The start timestamp; defaults to when you press start if empty.",
		value: config.startTimestamp || "",

		getDefault() {
			return Date.now();
		}
	}
};

const DiscordRPC = window.require("discord-rpc");
const rpc = new DiscordRPC.Client({ transport: "ipc" });

export default function App() {
	const [fieldsState, setFieldsState] = React.useState(fields);
	const [running, setRunning] = React.useState(config.autoStart);
	const [isReady, setIsReady] = React.useState(false);

	React.useEffect(() => {
		fs.writeFileSync("./config.json", JSON.stringify(config = Object.fromEntries([
			...Object.entries(fieldsState).map(([key, value]) => [key, value.value]),
			["autoStart", config.autoStart]
		]), null, "\t"));
	}, [fieldsState]);

	const onReady = React.useCallback(() => {
		rpc.setActivity(
			Object.fromEntries(
				Object.entries(fieldsState).map(
					([key, value]) => [key, value.value || fields[key].getDefault?.()]
				).filter(([, value]) => value)
			)
		);

		setIsReady(true);
	}, [fieldsState]);

	React.useEffect(() => {
		rpc.removeAllListeners("ready");

		if (running) {
			if (!fieldsState.applicationId.value) {
				return new Notification(
					"Error",
					{ body: "Application ID is required." }
				) && null;
			}

			if (isReady) {
				onReady();
			}
			else {
				rpc.on("ready", onReady);
				rpc.login({ clientId: fieldsState.applicationId.value });
			}
		}
	}, [running]);

	return (
		<div className="App">
			<div className="Main">
				{Object.entries(fieldsState).map(([key, field]) => field.title && (
					<Field
						key={key}
						title={field.title}
						description={field.description}
						image={field.image}
						placeholder={field.placeholder || ""}
						value={field.value}
						onChange={e => setFieldsState({
							...fieldsState,
							[key]: {
								...field,
								value: e.target.value
							}
						})}
					/>
				))}

				<div className="ButtonsContainer Flex">
					{running
						? (
							<React.Fragment>
								<div className="Button Yellow" onClick={() => (setRunning(false), setTimeout(() => setRunning(true), 100))}>
									Restart
								</div>

								<div className="Button Red" onClick={() => setRunning(false)}>
									Stop
								</div>
							</React.Fragment>
						)
						: (
							<div className="Button Green" onClick={() => setRunning(true)}>
								Start
							</div>
						)
					}
				</div>

				<SwitchItem
					title="Auto Start"
					defaultValue={config.autoStart}
					callback={value => config.autoStart = value}
				/>

				<h1>Developer Portal</h1>

				<p>
					This is where you'll set up your rich presence apps.
				</p>

				<p>
					Please note that Discord is shit and will put you in the main app after signing in. To fix this, simply press Ctrl + R after signing in.
				</p>

				<webview
					src="https://discord.com/developers"
					style={{
						width: "100%",
						height: "80vh",
						borderRadius: "7px",
						overflow: "hidden",
					}}
				/>
			</div>
		</div>
	);
}

function Field({ title, description = null, image = null, ...props }) {
	return (
		<div className="Field">
			<h1 className="Title">{title}</h1>
			<p className="Description">
				{description}

				{image && (
					<img
						className="Image"
						src={image}
					/>
				)}
			</p>

			<input
				type="text"
				{...props}
			/>
		</div>
	);
}