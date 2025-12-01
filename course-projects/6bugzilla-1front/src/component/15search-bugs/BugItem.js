import { memo } from "react";

const BugItem = memo(function BugItem({ bug, props }) {

    const handleSummaryClick = () => {
        props.history.push(`/view-bug/${bug._id}`);
    };

    return (
        <tr>
            <td>{bug.product.name}</td>
            <td>{bug.component.name}</td>
            <td>{bug.assignee.name}</td>
            <td>{bug.status}</td>
            <td>{bug.resolution ? bug.resolution : '---'}</td>
            <td onClick={handleSummaryClick}><p className="link-like">{bug.summary}</p></td>
            <td>{new Date(bug.updatedAt).toLocaleDateString()}</td>
        </tr>
    );
});

export default BugItem;