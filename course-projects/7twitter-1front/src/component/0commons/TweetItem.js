import React, { memo, useContext, useState } from "react";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import {
    Badge,
    Card,
    CardBody,
    CardText,
    Col,
    Row,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";
import { API_URL } from "../../rest/api.rest";
import TweetImage from "../7tweets/TweetImage";
import { useTweetActions } from "../../hooks/useTweetActions";
import { UserContext } from "../../contexts/user.context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons/faTrashAlt";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons/faPencilAlt";
import { useDeleteTweet } from "../../rest/useRestTweets";
import { TweetsContext, DispatchContext } from "../../contexts/tweets.context";
import AddEditTweet from "../8add-edit-tweets/AddEditTweet";

const TweetItem = memo(function TweetItem({ tweet, history, triggerReload, setError }) {
    const tweets = useContext(TweetsContext);
    const dispatch = useContext(DispatchContext);
    const loggedUser = useContext(UserContext);
    const isCreator = tweet?.creator._id === loggedUser.userId;
    const isAdmin = loggedUser.isAdmin;
    const deleteTweet = useDeleteTweet();

    const { showActionButtons } = useTweetActions(
        { history },
        triggerReload,
        setError
    );

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTweetId, setEditTweetId] = useState(null);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleEditTweet = () => {
        setEditTweetId(tweet._id); // Set the tweet ID for editing
        toggleModal(); // Open the modal
    };

    const handleDeleteTweet = () => {
        console.log(`Deleting tweet with ID: ${tweet._id}`);
        deleteTweet(tweet._id)
            .then(() => {
                dispatch({ type: "DELETE_TWEET", payload: { _id: tweet._id } });
                setError(null);
                triggerReload();
                history.push("/");
            })
            .catch((err) => {
                console.error(err);
                setError("Tweet could not be deleted: " + err.message);
            });
    };

    const getEditDeleteButtons = () => {
        if (loggedUser.isLogged) {
            return (
                (isAdmin || isCreator) && (
                    <Col sm={1} className="text-end">
                        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="mt-2">
                            <DropdownToggle className="p-0" style={{ background: "transparent", border: "none" }}>
                                <span style={{ fontSize: "1.5rem", cursor: "pointer", color: "#808080" }}>⋮</span>
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={handleEditTweet} className={"text-primary"}>
                                    <FontAwesomeIcon icon={faPencilAlt} className="me-2"></FontAwesomeIcon>Edit
                                </DropdownItem>
                                <DropdownItem onClick={handleDeleteTweet} className={"text-danger"}>
                                    <FontAwesomeIcon icon={faTrashAlt} className="me-2"></FontAwesomeIcon>Delete
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </Col>
                )
            );
        }
    };

    return (
        <div key={tweet._id} className="mb-3">
            <Card className="mb-3">
                <CardBody>
                    <Row>
                        <Col sm={1}>
                            <img
                                src={`${API_URL}/${tweet.creator.image}`}
                                alt="Profile"
                                style={{
                                    width: "70px",
                                    height: "70px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                        </Col>
                        <Col sm={10}>
                            <div className="d-flex justify-content-between mb-1">
                                <div>
                                    <strong>
                                        <Link to={`/profile/${tweet.creator._id}`}>{tweet.creator.name}</Link>
                                    </strong>
                                    <span className="text-muted">
                                        {" "}
                                        @{tweet.creator.email} · {new Date(tweet.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <CardText>{tweet.text}</CardText>
                            {tweet.image && <TweetImage imageUrl={`${API_URL}/${tweet.image}`} />}
                            {showActionButtons(tweet)}
                        </Col>
                        {getEditDeleteButtons()}
                    </Row>
                </CardBody>
            </Card>
            <AddEditTweet isOpen={isModalOpen} toggle={toggleModal} tweetId={editTweetId} triggerReload={triggerReload} />
        </div>
    );
});

export default withRouter(TweetItem);