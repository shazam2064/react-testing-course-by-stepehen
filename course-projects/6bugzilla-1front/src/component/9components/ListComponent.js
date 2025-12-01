import React, {useContext, useEffect, useState} from 'react';
import {ComponentsContext, DispatchContext} from '../../contexts/components.context';
import {useDeleteComponent, useFetchComponents} from "../../rest/useRestComponent";
import {UserContext} from "../../contexts/user.context";
import {TitleContext} from "../../contexts/title.context";
import {withRouter} from "react-router-dom";
import ComponentItem from "./ComponentItem";
import {Alert, Table} from "reactstrap";

function ListComponent(props) {
    const components = useContext(ComponentsContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchComponents = useFetchComponents();
    const deleteComponent = useDeleteComponent();
    const [refreshComponents, setRefreshComponents] = useState(true);
    const loggedUser = useContext(UserContext);
    const { setTitle } = useContext(TitleContext);
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (refreshComponents) {
            setRefreshComponents(false);
            fetchComponents().then(components => {
                dispatch({ type: 'SET_COMPONENTS', components: components });
            }).catch(error => {
                dispatch({ type: 'SET_COMPONENTS', components: [] });
                setError(error.message);
            });
        }

        setTitle('Component Management');
    }, [refreshComponents, setTitle]);

    const handleEditComponent = (componentId) => {
        props.history.push('/admin/edit-component/' + componentId);
    }

    const handleDeleteComponent = (componentId) => {
        deleteComponent(componentId).then(() => {
            dispatch({ type: 'DELETE_COMPONENT', payload: { _id: componentId } });
            setError(null);
            setRefreshComponents(true);
        }).catch(error => {
            setError('Component could not be deleted: ' + error.message);
        });
    }

    const handleAddComponent = () => {
        props.history.push('/admin/add-component');
    }

    const showActionButtons = (component) => {
        return (
            <>
                <button className="btn btn-outline-success me-2 mb-2" onClick={() => handleEditComponent(component._id)}>Edit</button>
                <button className="btn btn-outline-danger me-4" onClick={() => handleDeleteComponent(component._id)}>Delete</button>
            </>
        );
    }

    return (
        <div className="container p-5 my-2 mx-auto bg-light border-3 border rounded">
            <h1 className="mb-3 display-5">Component Management</h1>
            <div className="mb-3 d-flex justify-content-end">
                <button className="btn btn-outline-secondary" onClick={handleAddComponent}>Add Component</button>
            </div>
            {error ? (
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            ) : (
                components.length === 0 ? (
                    <Alert color="warning">
                        <h4 className="alert-heading">Sorry...</h4>
                        No components found.
                    </Alert>
                ) : (
                    <Table responsive>
                        <thead className="table-secondary">
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>CC</th>
                            <th>Product</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {components.map(component => (
                            <ComponentItem
                                key={component._id}
                                component={component}
                                actionButtons={showActionButtons(component)}
                            />
                        ))}
                        </tbody>
                    </Table>
                )
            )}
        </div>
    );
}

export default withRouter(ListComponent);