import { memo } from "react";

const ComponentItem = memo(function ComponentItem({ component, actionButtons }) {
    return (
        <tr key={component._id} scope="row">
            <td>{component.name}</td>
            <td>{component.description}</td>
            <td>{component.assignee.name}</td>
            <td>
                {component.CC.map(cc => (
                    <div key={cc._id}>{cc.email}</div>
                ))}
            </td>
            <td>{component.product.name}</td>
            <td>{actionButtons}</td>
        </tr>
    );
});

export default ComponentItem;