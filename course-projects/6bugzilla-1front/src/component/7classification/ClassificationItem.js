import { memo } from "react";

const ClassificationItem = memo(function ClassificationItem({ classification, actionButtons }) {
    return (
        <tr key={classification._id} scope="row">
            <td>{classification.name}</td>
            <td>{classification.description}</td>
            <td>{classification.products.length}</td>
            <td>{actionButtons}</td>
        </tr>
    );
});

export default ClassificationItem;