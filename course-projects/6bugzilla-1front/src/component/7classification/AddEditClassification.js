import React, {useContext, useEffect, useState} from 'react';
import {ClassificationsContext} from "../../contexts/classifications.context";
import {getInitialClassificationState} from "../../reducers/classification.reducer";
import {
    useCreateClassification,
    useFetchClassificationById,
    useUpdateClassification
} from "../../rest/useRestClassifications";
import {UserContext} from "../../contexts/user.context";
import {TitleContext} from "../../contexts/title.context";
import {withRouter} from "react-router-dom";
import {Alert, Form, FormGroup, Input, Label} from "reactstrap";

function AddEditClassification(props) {
    const classifications = useContext(ClassificationsContext);
    const [classification, setClassification] = useState(getInitialClassificationState());
    const [error, setError] = useState(null);
    const createClassification = useCreateClassification();
    const updateClassification = useUpdateClassification();
    const fetchClassificationById = useFetchClassificationById();
    const {classificationId} = props.match.params;
    const isEditMode = !!classificationId;
    const loggedUser = useContext(UserContext);
    const isAdmin = loggedUser.isAdmin;
    const {setTitle} = useContext(TitleContext);
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (isEditMode) {
            fetchClassificationById(classificationId).then(classification => {
                setClassification(classification);
                setTitle(`Edit Classification: ${classification.name}`);
            }).catch(error => {
                setError(`Classification could not be fetched: ${error.message}`);
            });
        } else {
            setClassification(getInitialClassificationState());
            setTitle('Add Classification');
        }
    }, [classificationId, isEditMode, setTitle]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setClassification(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) {
            setVisible(true);
        }
        try {
            if (isEditMode) {
                await updateClassification(classification);
            } else {
                await createClassification(classification);
            }
            setError(null);
            props.history.push('/admin/classifications');
        } catch (error) {
            setError(`Classification could not be ${isEditMode ? 'updated' : 'created'}: ${error.message}`);
        }
    }

    if (!isAdmin) {
        return (
            <div className="container p-s5 my-4 col-8 mx-auto">
                <Alert color="warning">
                    <h4 className="alert-heading">
                        Unauthorized!
                    </h4>
                    <p>
                        Hey, you are not authorized to view this page.
                    </p>
                    <hr />
                    <p className="mb-0">
                        Go <a
                        className="alert-link"
                        onClick={() => props.history.push('/')}>
                        back
                    </a>.
                    </p>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container p-5 my-4 mx-auto bg-light border-3 border rounded">
            <h1 className="mb-3 display-5">{isEditMode ? 'Edit Classification' : 'Add Classification'}</h1>
            {error ?
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert> : null}
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="name">Name:</Label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        value={classification.name}
                        onChange={handleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="description">Description:</Label>
                    <Input
                        id="description"
                        name="description"
                        type="textarea"
                        value={classification.description}
                        onChange={handleChange}
                    />
                </FormGroup>
                <button className="btn btn-outline-secondary" type="submit">Save</button>
            </Form>
        </div>
    );
}

export default withRouter(AddEditClassification);