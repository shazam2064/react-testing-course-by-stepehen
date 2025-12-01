import {memo} from "react";

const ProductItem = memo(function ProductItem({product, actionButtons}) {
    return (
        <tr key={product._id} scope="row">
            <td>{product.name}</td>
            <td>{product.description}</td>
            <td>{product.version}</td>
            <td>{product.classification.name}</td>
            <td>{product.components.length}</td>
            <td>{actionButtons}</td>
        </tr>
    );
});

export default ProductItem;