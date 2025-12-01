import React, { useContext, useEffect, useState } from 'react';
import { ClassificationsContext, DispatchContext } from '../../contexts/classifications.context';
import { useDeleteClassification, useFetchClassifications } from "../../rest/useRestClassifications";
import { UserContext } from "../../contexts/user.context";
import { TitleContext } from "../../contexts/title.context";
import { withRouter } from "react-router-dom";
import ClassificationItem from "./ClassificationItem";
import {Alert, Table} from "reactstrap";

function ListClassification(props) {
    const classifications = useContext(ClassificationsContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchClassifications = useFetchClassifications();
    const deleteClassification = useDeleteClassification();
    const [refreshClassifications, setRefreshClassifications] = useState(true);
    const loggedUser = useContext(UserContext);
    const { setTitle } = useContext(TitleContext);
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (refreshClassifications) {
            setRefreshClassifications(false);
            fetchClassifications().then(classifications => {
                dispatch({ type: 'SET_CLASSIFICATIONS', classifications: classifications });
            }).catch(error => {
                dispatch({ type: 'SET_CLASSIFICATIONS', classifications: [] });
                setError(error.message);
            });
        }

        setTitle('Classification Management');
    }, [refreshClassifications, setTitle]);

    const handleEditClassification = (classificationId) => {
        props.history.push('/admin/edit-classification/' + classificationId);
    }

    const handleDeleteClassification = (classificationId) => {
        deleteClassification(classificationId).then(() => {
            dispatch({ type: 'DELETE_CLASSIFICATION', payload: { _id: classificationId } });
            setError(null);
            setRefreshClassifications(true);
        }).catch(error => {
            setError('Classification could not be deleted: ' + error.message);
        });
    }

    const handleAddClassification = () => {
        props.history.push('/admin/add-classification');
    }

    const showActionButtons = (classification) => {
        return (
            <>
                <button className="btn btn-outline-success me-2" onClick={() => handleEditClassification(classification._id)}>Edit</button>
                <button className="btn btn-outline-danger me-4" onClick={() => handleDeleteClassification(classification._id)}>Delete</button>
            </>
        );
    }

    return (
        <div className="container p-5 my-2 mx-auto bg-light border-3 border rounded">
            <h1 className="mb-3 display-5">Classification Management</h1>
            <div className="mb-3 d-flex justify-content-end">
                <button className="btn btn-outline-secondary" onClick={handleAddClassification}>Add Classification</button>
            </div>
            {error ? (
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            ) : (
                classifications.length === 0 ? (
                    <Alert color="warning">
                        <h4 className="alert-heading">Sorry...</h4>
                        No classifications found.
                    </Alert>
                ) : (
                    <Table responsive>
                        <thead className="table-secondary">
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Number of Products</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {classifications.map(classification => (
                            <ClassificationItem
                                key={classification._id}
                                classification={classification}
                                actionButtons={showActionButtons(classification)}
                            />
                        ))}
                        </tbody>
                    </Table>
                )
            )}
        </div>
    );
}

export default withRouter(ListClassification);