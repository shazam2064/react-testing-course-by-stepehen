import React, { useState, memo } from "react";
import { withRouter } from "react-router-dom";
import {Accordion, AccordionBody, AccordionHeader, AccordionItem} from "reactstrap";

const UserItem = memo(function UserItem({ adminUser, history, actionButtons }) {
    const [open, setOpen] = useState('');
    const toggle = (id) => {
        if (open === id) {
            setOpen();
        } else {
            setOpen(id);
        }
    };

    return (
        <div key={adminUser._id}>
            <Accordion flush open={open} toggle={toggle}>
                <AccordionItem>
                    <AccordionHeader targetId="1">
                        <div className="d-flex justify-content-between w-100">
                            <h1 className="h5 mb-0">
                                {adminUser.name}
                            </h1>
                            <div>{actionButtons}</div>
                        </div>
                    </AccordionHeader>
                    <AccordionBody accordionId="1">
                        <p>Email: <span className="text-muted">{adminUser.email}</span></p>
                        <p>IsAdmin: <span className="text-muted">{adminUser.isAdmin ? "Yes" : "No"}</span></p>
                    </AccordionBody>
                </AccordionItem>
            </Accordion>
        </div>
    );
});

export default withRouter(UserItem);