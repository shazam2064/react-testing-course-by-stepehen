import React, { useContext, useEffect, useState } from 'react';
import { ComponentsContext } from "../../contexts/components.context";
import { ProductsContext, DispatchContext as ProductsDispatch} from "../../contexts/products.context";
import { AdminUsersContext, DispatchContext as AdminUsersDispatch } from "../../contexts/admin-users.context";
import { getInitialComponentState } from "../../reducers/component.reducer";
import { useCreateComponent, useFetchComponentById, useUpdateComponent } from "../../rest/useRestComponent";
import { useFetchProducts } from "../../rest/useRestProducts";
import { useFetchAdminUsers } from "../../rest/useRestAdminUsers";
import { UserContext } from "../../contexts/user.context";
import { TitleContext } from "../../contexts/title.context";
import {Alert, Button, Form, FormGroup, Input, Label} from "reactstrap";

function AddEditComponent(props) {
    const components = useContext(ComponentsContext);
    const products = useContext(ProductsContext);
    const adminUsers = useContext(AdminUsersContext);
    const productsDispatch = useContext(ProductsDispatch);
    const adminUsersDispatch = useContext(AdminUsersDispatch);
    const [component, setComponent] = useState(getInitialComponentState()[0]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [error, setError] = useState(null);
    const createComponent = useCreateComponent();
    const updateComponent = useUpdateComponent();
    const fetchComponentById = useFetchComponentById();
    const fetchProducts = useFetchProducts();
    const fetchUsers = useFetchAdminUsers();
    const { componentId } = props.match.params;
    const isEditMode = !!componentId;
    const loggedUser = useContext(UserContext);
    const isAdmin = loggedUser.isAdmin;
    const { setTitle } = useContext(TitleContext);
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (isEditMode) {
            fetchComponentById(componentId).then(component => {
                setComponent(component);
                setSelectedProduct(component.product._id);
                setSelectedAssignee(component.assignee._id);
                setTitle(`Edit Component: ${component.name}`);
            }).catch(error => {
                setError(`Component could not be fetched: ${error.message}`);
            });
        } else {
            setComponent(getInitialComponentState()[0]);
            setTitle('Add Component');
        }

        fetchProducts().then(products => {
            productsDispatch({ type: 'SET_PRODUCTS', products: products });
        }).catch(error => {
            productsDispatch({ type: 'SET_PRODUCTS', products: [] });
            setError(error.message);
        });

        fetchUsers().then(users => {
            adminUsersDispatch({ type: 'SET_ADMIN_USERS', adminUsers: users });
        }).catch(error => {
            adminUsersDispatch({ type: 'SET_ADMIN_USERS', adminUsers: [] });
            setError(error.message);
        });
    }, [componentId, isEditMode, setTitle]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setComponent(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    const handleProductChange = (e) => {
        setSelectedProduct(e.target.value);
        setComponent(prevState => ({
            ...prevState,
            product: e.target.value
        }));
    }

    const handleAssigneeChange = (e) => {
        setSelectedAssignee(e.target.value);
        setComponent(prevState => ({
            ...prevState,
            assignee: e.target.value
        }));
    }

    const handleCCChange = (e) => {
        if (!e.target.value) {
            return;
        }
        const searchedCC = e.target.value;
        if (searchedCC && !component.CC.some(cc => (cc._id ? cc._id : cc) === searchedCC)) {
            setComponent(prevState => ({
                ...prevState,
                CC: [...prevState.CC, searchedCC]
            }));
        }
    }

    const handleRemoveCC = (searchedCC) => {
        setComponent(prevState => ({
            ...prevState,
            CC: prevState.CC.filter(cc => (cc._id ? cc._id : cc) !== searchedCC)
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) {
            setVisible(true);
        }
        try {
            if (isEditMode) {
                await updateComponent(component);
            } else {
                await createComponent(component);
            }
            setError(null);
            props.history.push('/admin/components');
        } catch (error) {
            setError(`Component could not be ${isEditMode ? 'updated' : 'created'}: ${error.message}`);
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
            <h1 className="mb-3 display-5">{isEditMode ? 'Edit Component' : 'Add Component'}</h1>
            {error ?
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert> : null}
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="product">Product</Label>
                    <Input id="product" value={selectedProduct} onChange={handleProductChange} type="select">
                        <option value="" key="" name="">Select a product</option>
                        {products.map(product => (
                            <option key={product._id} value={product._id}>{product.name}</option>
                        ))}
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="name">Name:</Label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        value={component.name}
                        onChange={handleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="description">Description:</Label>
                    <Input
                        type="textarea"
                        id="description"
                        name="description"
                        value={component.description}
                        onChange={handleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="assignee">Assignee</Label>
                    <Input id="assignee" value={selectedAssignee} onChange={handleAssigneeChange} type="select">
                        <option value="" key="" name="">Select an assignee</option>
                        {adminUsers.map(user => (
                            <option key={user._id} value={user._id}>{user.name}</option>
                        ))}
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="CC">CC</Label>
                    <Input id="CC" onChange={handleCCChange} type="select">
                        <option value="" key="" name="">Select a CC</option>
                        {adminUsers.map(user => (
                            <option key={user._id} value={user._id}>{user.email}</option>
                        ))}
                    </Input>
                    <div className="mt-3 d-flex flex-wrap">
                        {component.CC.map(CCId => {
                            let searchedCC;
                            if (CCId._id) {
                                searchedCC = CCId._id;
                            } else {
                                searchedCC = CCId;
                            }
                            const CC = adminUsers.find(CC => CC._id === searchedCC) ?? { email: "" };
                            return (
                                <div key={searchedCC} className="d-flex text-primary align-items-center border border-primary rounded mx-1 py-0 px-1">
                                    {CC.email}
                                    <Button close className="ml-2 py-0" onClick={() => handleRemoveCC(searchedCC)}></Button>
                                </div>
                            );
                        })}
                    </div>
                </FormGroup>
                <button type="submit" className="btn btn-outline-secondary">Save</button>
            </Form>
        </div>
    );
}

export default AddEditComponent;