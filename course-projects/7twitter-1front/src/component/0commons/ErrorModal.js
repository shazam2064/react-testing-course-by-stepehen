import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';

function ErrorModal({ error }) {
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

    useEffect(() => {
        if (error) {
            setIsErrorModalOpen(true);
        }
    }, [error]);

    const toggleModal = () => {
        setIsErrorModalOpen(false);
    };

    return (
        <Modal isOpen={isErrorModalOpen} toggle={toggleModal}>
            <ModalHeader className="text-danger" toggle={toggleModal}>Error</ModalHeader>
            <ModalBody>
                <p>{error}</p>
                <Button color="danger" outline={true} onClick={toggleModal}>
                    Close
                </Button>
            </ModalBody>
        </Modal>
    );
}

export default ErrorModal;