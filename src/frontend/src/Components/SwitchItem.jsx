import React from "react";
import "./SwitchItem.scss";

export default function SwitchItem({ title, defaultValue, callback }) {
    return (
        <div className="SwitchItem">
            <div className="Title">{title}</div>
            
            <input className="Switch"
                   type="checkbox"
                   defaultChecked={defaultValue}
                   onInput={e => callback?.(e.currentTarget.checked)}/>
        </div>
    );
}