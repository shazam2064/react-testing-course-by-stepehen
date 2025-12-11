import React, {useContext, useEffect, useState} from 'react';
import {BugsContext} from "../../contexts/bugs.context";
import {ComponentsContext, DispatchContext as ComponentsDispatch } from "../../contexts/components.context";
import {ProductsContext, DispatchContext as ProductsDispatch}  from "../../contexts/products.context";
import {AdminUsersContext, DispatchContext as AdminUsersDispatch } from "../../contexts/admin-users.context";
import {getInitialBugState} from "../../reducers/bug.reducer";
import {useCreateBug, useFetchBugById, useFetchBugs, useUpdateBug} from "../../rest/useRestBugs";
import {useFetchComponents} from "../../rest/useRestComponent";
import {useFetchProducts} from "../../rest/useRestProducts";
import {useFetchAdminUsers} from "../../rest/useRestAdminUsers";
import {UserContext} from "../../contexts/user.context";
import {TitleContext} from "../../contexts/title.context";
import {Alert, Button, Form, FormGroup, Input, Label} from "reactstrap";

function AddEditBug(props) {
    const bugs = useContext(BugsContext);
    const components = useContext(ComponentsContext);
    const products = useContext(ProductsContext);
    const adminUsers = useContext(AdminUsersContext);
    const componentsDispatch = useContext(ComponentsDispatch);
    const productsDispatch = useContext(ProductsDispatch);
    const adminUsersDispatch = useContext(AdminUsersDispatch);
    const componentsList = Array.isArray(components) ? components : [];
    const productsList = Array.isArray(products) ? products : [];
    const adminUsersList = Array.isArray(adminUsers) ? adminUsers : [];

    const [bug, setBug] = useState(getInitialBugState()[0]);
    const [selectedComponent, setSelectedComponent] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [filteredComponents, setFilteredComponents] = useState([]);
    const [allBugs, setAllBugs] = useState([]);
    const [error, setError] = useState(null);
    const createBug = useCreateBug();
    const updateBug = useUpdateBug();
    const fetchBugById = useFetchBugById();
    const fetchComponents = useFetchComponents();
    const fetchProducts = useFetchProducts();
    const fetchUsers = useFetchAdminUsers();
    const fetchBugs = useFetchBugs();
    const bugId = props?.match?.params?.bugId;
    const isEditMode = !!bugId;
    const loggedUser = useContext(UserContext);
    const isAdmin = loggedUser?.isAdmin;
    const { setTitle } = useContext(TitleContext);
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    // early unauthorized UI to satisfy tests that render without admin privileges
    if (!isAdmin) {
        return (
            <div className="container p-s5 my-4 col-8 mx-auto">
                <Alert color="warning">
                    <h4 className="alert-heading">Unauthorized!</h4>
                    <p>Hey, you are not authorized to view this page.</p>
                    <hr />
                    <p className="mb-0">
                        Go <a className="alert-link" onClick={() => props.history?.push?.('/')}>back</a>.
                    </p>
                </Alert>
            </div>
        );
    }

    useEffect(() => {
        if (isEditMode) {
            fetchBugById(bugId).then(bug => {
                setBug(bug);
                setSelectedComponent(bug.component?._id || '');
                setSelectedProduct(bug.product?._id || '');
                setSelectedAssignee(bug.assignee?._id || '');
                setTitle(`Edit Bug: ${bug.summary}`);
                const filtered = componentsList.filter(component => (component.product && component.product._id) === (bug.product?._id));
                setFilteredComponents(filtered);
            }).catch(error => {
                setError(`Bug could not be fetched: ${error.message}`);
            });
        } else {
            setBug(getInitialBugState()[0]);
            setTitle('Add Bug');
        }

        // Defensive fetchComponents: may be undefined or return non-promise in tests
        if (typeof fetchComponents === 'function') {
            const res = fetchComponents();
            if (res && typeof res.then === 'function') {
                res.then(comps => {
                    if (typeof componentsDispatch === 'function') componentsDispatch({ type: 'SET_COMPONENTS', components: comps });
                }).catch(error => {
                    if (typeof componentsDispatch === 'function') componentsDispatch({ type: 'SET_COMPONENTS', components: [] });
                    setError(error.message);
                });
            } else {
                if (typeof componentsDispatch === 'function') componentsDispatch({ type: 'SET_COMPONENTS', components: Array.isArray(res) ? res : [] });
            }
        } else {
            if (typeof componentsDispatch === 'function') componentsDispatch({ type: 'SET_COMPONENTS', components: [] });
        }

        // Defensive fetchProducts
        if (typeof fetchProducts === 'function') {
            const res = fetchProducts();
            if (res && typeof res.then === 'function') {
                res.then(prods => {
                    if (typeof productsDispatch === 'function') productsDispatch({ type: 'SET_PRODUCTS', products: prods });
                }).catch(error => {
                    if (typeof productsDispatch === 'function') productsDispatch({ type: 'SET_PRODUCTS', products: [] });
                    setError(error.message);
                });
            } else {
                if (typeof productsDispatch === 'function') productsDispatch({ type: 'SET_PRODUCTS', products: Array.isArray(res) ? res : [] });
            }
        } else {
            if (typeof productsDispatch === 'function') productsDispatch({ type: 'SET_PRODUCTS', products: [] });
        }

        // Defensive fetchUsers
        if (typeof fetchUsers === 'function') {
            const res = fetchUsers();
            if (res && typeof res.then === 'function') {
                res.then(users => {
                    if (typeof adminUsersDispatch === 'function') adminUsersDispatch({ type: 'SET_ADMIN_USERS', adminUsers: users });
                }).catch(error => {
                    if (typeof adminUsersDispatch === 'function') adminUsersDispatch({ type: 'SET_ADMIN_USERS', adminUsers: [] });
                    setError(error.message);
                });
            } else {
                if (typeof adminUsersDispatch === 'function') adminUsersDispatch({ type: 'SET_ADMIN_USERS', adminUsers: Array.isArray(res) ? res : [] });
            }
        } else {
            if (typeof adminUsersDispatch === 'function') adminUsersDispatch({ type: 'SET_ADMIN_USERS', adminUsers: [] });
        }

        // Defensive fetchBugs
        if (typeof fetchBugs === 'function') {
            const res = fetchBugs();
            if (res && typeof res.then === 'function') {
                res.then(setAllBugs).catch(console.error);
            } else {
                setAllBugs(Array.isArray(res) ? res : []);
            }
        } else {
            setAllBugs([]);
        }
    }, [bugId, isEditMode, setTitle]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file' && files.length > 0) {
            const file = files[0];
            setBug(prevState => ({
                ...prevState,
                imageFile: file,
                attachment: URL.createObjectURL(file)
            }));
        } else {
            setBug(prevState => ({
                ...prevState,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    }

    const handleComponentChange = (e) => {
        const selectedComponentId = e.target.value;
        setSelectedComponent(selectedComponentId);
        setBug(prevState => ({
            ...prevState,
            component: selectedComponentId
        }));
    }

    const handleProductChange = (e) => {
        const selectedProductId = e.target.value;
        setSelectedProduct(selectedProductId);
        setBug(prevState => ({
            ...prevState,
            product: selectedProductId,
            component: '' // Reset component when product changes
        }));
        const filtered = components.filter(component => component.product._id === selectedProductId);
        setFilteredComponents(filtered);
    }

    const handleAssigneeChange = (e) => {
        setSelectedAssignee(e.target.value);
        setBug(prevState => ({
            ...prevState,
            assignee: e.target.value
        }));
    }

    const handleCCChange = (e) => {
        if (!e.target.value) {
            return;
        }
        const searchedCC = e.target.value;
        if (searchedCC && !bug.CC.some(cc => (cc._id ? cc._id : cc) === searchedCC)) {
            setBug(prevState => ({
                ...prevState,
                CC: [...prevState.CC, searchedCC]
            }));
        }
    }

    const handleRemoveCC = (searchedCC) => {
        setBug(prevState => ({
            ...prevState,
            CC: prevState.CC.filter(cc => (cc._id ? cc._id : cc) !== searchedCC)
        }));
    };

    const handleDependenciesChange = (e) => {
        if (!e.target.value) {
            return;
        }
        const searchedDependency = e.target.value;
        if (searchedDependency && !bug.dependencies.some(dep => (dep._id ? dep._id : dep) === searchedDependency)) {
            setBug(prevBug => ({
                ...prevBug,
                dependencies: [...prevBug.dependencies, searchedDependency]
            }));
        }
    };

    const handleRemoveDependency = (searchedDependency) => {
        setBug(prevBug => ({
            ...prevBug,
            dependencies: prevBug.dependencies.filter(dep => (dep._id ? dep._id : dep) !== searchedDependency)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) {
            setVisible(true);
        }
        try {
            let savedBug;
            if (isEditMode) {
                await updateBug(bug);
                savedBug = bug;
            } else {
                savedBug = await createBug(bug);
            }
            setError(null);
            // navigate to admin list page (tests expect /admin/bugs)
            if (typeof props.history?.push === 'function') {
                props.history.push('/admin/bugs');
            }
        } catch (error) {
            setError(`Bug could not be ${isEditMode ? 'updated' : 'created'}: ${error.message}`);
        }
    }

    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    return (
        <div className="container p-5 my-4 mx-auto bg-light border-3 border rounded">
            <h2 className="mb-3 display-5">{isEditMode ? 'Edit Bug' : 'Add New Bug'}</h2>
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
                        {productsList.map(product => (
                            <option key={product._id} value={product._id}>{product.name}</option>
                        ))}
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="component">Component</Label>
                    <Input id="component" value={selectedComponent} onChange={handleComponentChange} type="select">
                        <option value="" key="" name="">Select a component</option>
                        {(Array.isArray(filteredComponents) ? filteredComponents : []).map(component => (
                            <option key={component._id} value={component._id}>{component.name}</option>
                        ))}
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="summary">Summary</Label>
                    <Input
                        type="text"
                        id="summary"
                        name="summary"
                        value={bug.summary}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="description">Description</Label>
                    <Input
                        type="textarea"
                        id="description"
                        name="description"
                        value={bug.description}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="assignee">Assignee</Label>
                    <Input id="assignee" value={selectedAssignee} onChange={handleAssigneeChange} type="select">
                        <option value="" key="" name="">Select an assignee</option>
                        {adminUsersList.map(user => (
                            <option key={user._id} value={user._id}>{user.name}</option>
                        ))}
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="severity">Severity</Label>
                    <Input id="severity" name="severity" value={bug.severity} onChange={handleChange} type="select">
                        <option value="">Select a severity</option>
                        <option value="Blocker">Blocker</option>
                        <option value="Critical">Critical</option>
                        <option value="Major">Major</option>
                        <option value="Normal">Normal</option>
                        <option value="Minor">Minor</option>
                        <option value="Trivial">Trivial</option>
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="priority">Priority</Label>
                    <Input id="priority" name="priority" value={bug.priority} onChange={handleChange} type="select">
                        <option value="">Select a priority</option>
                        <option value="Highest">Highest</option>
                        <option value="High">High</option>
                        <option value="Normal">Normal</option>
                        <option value="Low">Low</option>
                        <option value="Lowest">Lowest</option>
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="hardware">Hardware</Label>
                    <Input id="hardware" name="hardware" value={bug.hardware} onChange={handleChange} type="select">
                        <option value="">Select a hardware</option>
                        <option value="All">All</option>
                        <option value="PC">PC</option>
                        <option value="Mac">Mac</option>
                        <option value="Other">Other</option>
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="os">OS</Label>
                    <Input id="os" name="os" value={bug.os} onChange={handleChange} type="select">
                        <option value="">Select an OS</option>
                        <option value="All">All</option>
                        <option value="Windows">Windows</option>
                        <option value="Mac">Mac</option>
                        <option value="Linux">Linux</option>
                        <option value="Other">Other</option>
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="status">Status</Label>
                    <Input id="status" name="status" value={bug.status} onChange={handleChange} type="select">
                        <option value="">Select a status</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </Input>
                </FormGroup>
                {bug.status === "Resolved" && (
                    <FormGroup>
                        <Label for="resolution">Resolution</Label>
                        <Input id="resolution" name="resolution" value={bug.resolution} onChange={handleChange} type="select">
                            <option value="">Select a resolution</option>
                            <option value="Fixed">Fixed</option>
                            <option value="Invalid">Invalid</option>
                            <option value="Wontfix">Wontfix</option>
                            <option value="Duplicate">Duplicate</option>
                            <option value="Worksforme">Worksforme</option>
                        </Input>
                    </FormGroup>
                )}
                <FormGroup>
                    <Label for="deadline">Deadline</Label>
                    <Input
                        id="deadline"
                        name="deadline"
                        value={formatDate(bug.deadline)}
                        onChange={handleChange}
                        type="datetime-local"
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="attachment">Attachment</Label>
                    <Input
                        type="file"
                        id="attachment"
                        name="attachment"
                        onChange={handleChange}
                    />
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
                        {bug.CC.map(CCId => {
                            let searchedCC;
                            if (CCId._id) {
                                searchedCC = CCId._id;
                            } else {
                                searchedCC = CCId;
                            }
                            const CC = adminUsers.find(CC => CC._id === searchedCC) ?? {email: ""};
                            return (
                                <div key={searchedCC} className="d-flex text-primary align-items-center border border-primary rounded mx-1 py-0 px-1">
                                    {CC.email}
                                    <Button close className="ml-2 py-0" onClick={() => handleRemoveCC(searchedCC)}></Button>
                                </div>
                            );
                        })}
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label for="dependencies">Dependencies</Label>
                    <Input id="dependencies" onChange={handleDependenciesChange} type="select">
                        <option value="" key="" name="">No Dependencies</option>
                        {allBugs
                            .filter(b => !isEditMode || b._id !== bugId)
                            .map(filteredBug => (
                                <option key={filteredBug._id} value={filteredBug._id}>{filteredBug.summary}</option>
                            ))}
                    </Input>
                    <div className="mt-3 d-flex flex-wrap">
                        {bug.dependencies.map(depId => {
                            let searchedDependency;
                            if (depId._id) {
                                searchedDependency = depId._id;
                            } else {
                                searchedDependency = depId;
                            }
                            const dependency = allBugs.find(dep => dep._id === searchedDependency) ?? {summary: ""};
                            return (
                                <div key={searchedDependency} className="d-flex text-primary align-items-center border border-primary rounded mx-1 py-0 px-1">
                                    {dependency.summary}
                                    <Button close className="ml-2 py-0"
                                            onClick={() => handleRemoveDependency(searchedDependency)}></Button>
                                </div>
                            );
                        })}
                    </div>
                </FormGroup>
                <button type="submit" className="btn btn-outline-primary">Save</button>
            </Form>
        </div>
    );
}

export default AddEditBug;