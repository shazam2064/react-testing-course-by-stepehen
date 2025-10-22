import React, {useContext, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {TagsContext, DispatchContext} from "../../contexts/tags.context";
import {useFetchTags, useDeleteTag, useUpdateTag, useCreateTag} from "../../rest/useRestTags";
import {UserContext} from "../../contexts/user.context";
import {
    Alert,
    Card,
    CardBody,
    CardFooter,
    CardGroup,
    CardText,
    CardTitle, FormGroup,
    Input,
    InputGroup,
    InputGroupText,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';

function Tags(props) {
    const tags = useContext(TagsContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState(false);
    const [tag, setTag] = useState({name: '', description: ''});
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentTagId, setCurrentTagId] = useState(null);
    const createTag = useCreateTag();
    const updateTag = useUpdateTag();
    const fetchTags = useFetchTags();
    const deleteTag = useDeleteTag();
    const [reload, setReload] = useState(true);
    const [dropdowns, setDropdowns] = useState({});
    const loggedUser = useContext(UserContext);
    const isAdmin = loggedUser.isAdmin;
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);
    const toggle = () => setModal(!modal);

    useEffect(() => {
        const getTags = async () => {
            try {
                const tags = await fetchTags();
                dispatch({type: 'SET_TAGS', tags});
                console.log('tags:', tags);
                setError(null);
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    dispatch({type: 'LOGOUT'});
                }
                dispatch({type: 'SET_TAGS', tags: []});
                setError('Tags could not be retrieved.');
            }
        };

        if (reload) {
            getTags();
            setReload(false);
        }
    }, [dispatch, reload]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDeleteTag = async (tagId) => {
        deleteTag(tagId).then(() => {
            dispatch({type: 'DELETE_ANSWER', payload: {_id: tagId}});
            setError(null);
            setReload(true);
        }).catch(error => {
            setError('Answer could not be deleted.');
        });
    };

    const handleAddTag = () => {
        setIsEditMode(false);
        setTag({name: '', description: ''});
        setModal(true);
    };

    const handleEditTag = (tagId, tagName, tagDescription) => {
        setIsEditMode(true);
        setCurrentTagId(tagId);
        setTag({_id: tagId, name: tagName, description: tagDescription});
        setModal(true);
    };

    const handleSaveTag = async () => {
        try {
            if (isEditMode) {
                await updateTag(currentTagId, tag);
                setIsEditMode(false);
            } else {
                await createTag(tag);
            }
        } catch (error) {
            setError('Failed to save tag: ' + error.message);
        }
        setModal(false);
        setReload(true);
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setTag(prevTag => ({
            ...prevTag,
            [name]: value
        }));
    };

    const toggleDropdown = (tagId) => {
        setDropdowns(prevDropdowns => ({
            ...prevDropdowns,
            [tagId]: !prevDropdowns[tagId]
        }));
    };

    const filteredTags = tags.filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <section className="container">
            <div>
                <h1 className="mb-3 display-3">Tags</h1>
                <p>A tag is a keyword or label that categorizes your question with other, similar questions. Using the
                    right tags makes it easier for others to find and answer your question.</p>
                <div className="d-flex justify-content-between align-items-center">
                    <InputGroup style={{width: '300px', height: '30px'}} className="mb-3 mt-2">
                        <InputGroupText style={{height: '37.5px'}}>
                            <FontAwesomeIcon icon={faSearch}/>
                        </InputGroupText>
                        <Input
                            style={{height: 'auto'}}
                            placeholder="Search tags..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </InputGroup>
                    {isAdmin && <button className="btn btn-outline-primary mt-0" onClick={handleAddTag}>+</button>}
                </div>
            </div>
            {error && (
                <Alert className="custom-alert" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            )}
            <CardGroup>
                {filteredTags.map(tag => (
                    <Card key={tag._id} className="mb-3 mx-3">
                        <CardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <CardTitle tag="h5">
                                    <Link to={`/question/${tag._id}`} className="tag-name">{tag.name}</Link>
                                </CardTitle>
                                {isAdmin && (
                                    <div className="tag-actions">
                                        <span className="edit-icon" role="img" aria-label="edit"
                                              onClick={() => handleEditTag(tag._id, tag.name, tag.description)}>✏️</span>
                                        <span className="delete-icon" role="img" aria-label="delete"
                                              onClick={() => handleDeleteTag(tag._id)}>🗑️</span>
                                    </div>
                                )}
                            </div>
                            <CardText>{tag.description}</CardText>
                        </CardBody>
                        <CardFooter>
                            <small className="text-muted">Questions: {tag.questions.length}</small>
                        </CardFooter>
                    </Card>
                ))}
            </CardGroup>
            {modal && (
                <Modal isOpen={modal} toggle={toggle} backdrop size="sm" fade centered onClose={() => setModal(false)}>
                    <ModalHeader toggle={toggle}>{isEditMode ? 'Edit Tag' : 'Add New Tag'}</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Input
                                type="text"
                                name="name"
                                id="tagName"
                                value={tag.name}
                                onChange={handleChange}
                                placeholder="Tag name"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Input
                                type="textarea"
                                name="description"
                                id="tagDescription"
                                value={tag.description}
                                onChange={handleChange}
                                placeholder="Tag description"
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <button className="btn btn-outline-primary" onClick={handleSaveTag}>Save</button>
                    </ModalFooter>
                </Modal>
            )}
        </section>
    );
}

export default Tags;