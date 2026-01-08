import React, {useEffect, useState} from 'react';
import { Modal, ModalHeader, ModalBody, Nav, NavItem, NavLink, TabContent, TabPane, List, Alert } from 'reactstrap';
import classnames from 'classnames';
import UserItem from '../2admin-users/UserItem';

function ProfileModal({ isOpen, toggle, adminUser, initialTab }) {
    const [activeTab, setActiveTab] = useState('1');

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab); // Set the active tab when the modal opens
        }
    }, [isOpen, initialTab]);

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const noResultsMessage = (type) => (
        <div className="my-4 mx-2" color="info">
            <h5 className="alert-heading">No {type} found...</h5>
        </div>
    );

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>User Connections</ModalHeader>
            <ModalBody>
                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === '1' })}
                            onClick={() => toggleTab('1')}
                        >
                            Followers
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === '2' })}
                            onClick={() => toggleTab('2')}
                        >
                            Following
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                        <List type="unstyled mt-3">
                            {adminUser.followers.length > 0 ? (
                                adminUser.followers.map((follower) => (
                                    <UserItem
                                        key={follower._id}
                                        adminUser={follower}
                                    />
                                ))
                            ) : (
                                noResultsMessage('followers')
                            )}
                        </List>
                    </TabPane>
                    <TabPane tabId="2">
                        <List type="unstyled mt-3">
                            {adminUser.following.length > 0 ? (
                                adminUser.following.map((followedUser) => (
                                    <UserItem
                                        key={followedUser._id}
                                        adminUser={followedUser}
                                    />
                                ))
                            ) : (
                                noResultsMessage('following')
                            )}
                        </List>
                    </TabPane>
                </TabContent>
            </ModalBody>
        </Modal>
    );
}

export default ProfileModal;