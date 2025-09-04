import React, { useContext, useEffect, useState } from 'react';
import { DispatchContext, ProductsContext } from '../../contexts/products.context';
import ProductItem from '../0commons/ProductItem';
import { withRouter } from 'react-router-dom';
import AddToCartButton from "./AddToCartButton";
import { useFetchProducts, useDeleteProduct } from "../../rest/useRestProducts";
import {Alert} from "reactstrap";

function ListProducts(props) {
    const products = useContext(ProductsContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchProducts = useFetchProducts();
    const deleteProduct = useDeleteProduct();
    const { adminProducts } = props;
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        const getProducts = async () => {
            try {
                const products = await fetchProducts();
                dispatch({ type: 'SET_PRODUCTS', products });
                setError(null);
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    dispatch({ type: 'LOGOUT' });
                }
                dispatch({ type: 'SET_PRODUCTS', products: [] });
                setError('Products could not be retrieved.');
            }
        };

        getProducts();

        if (error) {
            setVisible(true);
        }
    }, [dispatch, error]);

    const handleEditProduct = (prodId) => {
        props.history.push(`/admin/edit-product/${prodId}`);
    };

    const handleDeleteProduct = (prodId) => {
        deleteProduct(prodId).then(() => {
            dispatch({ type: 'DELETE_PRODUCT', payload: { _id: prodId } });
            setError(null);
        }).catch(error => {
            setError('Product could not be deleted.');
        });
    };

    const handleViewProduct = (prodId) => {
        console.log('Viewing product:', prodId);
        props.history.push(`/view-product/${prodId}`);
    }

    const showActionButtons = (product) => {
        console.log('adminProducts:', product._id);
        if (adminProducts) {
            return (
                <>
                    <button className="btn btn-outline-primary" onClick={() => handleEditProduct(product._id)}>Edit</button>
                    <button className="btn btn-outline-danger" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                </>
            );
        } else {
            return (
                <>
                    <button className="btn btn-outline-success" onClick={() => handleViewProduct(product._id)}>View Details</button>
                    <AddToCartButton productItem={product} />
                </>
            );
        }
        /*
         Dawg, Im bored... I kinda want to goon, but I swore to not to beat the flounder forever, or at least this month
        Each time I do the guilt is too strong, and not to mention the hornyness is very versatile makes me less scared
        to rizz or even makes me a better runner, so I cant lose it by gooning. Now i'm bored and horny, I can't do other stuff rn
        like running, reading, playing a game, or talk to a friend. So it really is....

        To goon or not to goon, that is the question
        Wheter 'tis nobler in the mind to suffer
        The slings and arrrows of outrageous ardor
        Or to take arms againsts a sea of troubles
        And by opposing end them. To goon-- to bust,
        No more; and by a bust to say we end
        The lust and the thousand horny impulses
        That dih is heir to, 'tis a consummation
        Devoutly to be wish'd. To goon, to bust;
        To bust-- perchance to edge: ay, there's the rub:
        For in that bust of nut what climaxes may edge,
        When we have exploded off this mortal coil,
        Must give us pause-- there's the shame
        That makes calamity of so long life.


        Aarrrggghh, I know I musnt. This to and fro, danced many times I have
        Yet that very second of ecstacy, hell maybe even less, makes me feel so alive.
        Nevertheless the price is the unawavering weight of guilt and shame, too expensive to pay
        Still in blinding passion of desire, those seducing curves as sweat and fluid trickle down them
        are marvelous. And as moist lips meet and crash, the spark to the ember is set ablaze, bringing
        forth a hellish fire, its flames licking and groping my very core. And thus swallowing all in its path
        leaving only ashes behind and the vast empty air, reminder of my own lonelyness...

        I want to goon, and each time i get a thirstrap or see something in the very little provoking this urge only grows
        I know I have to conquer it, for the freedom to do such things, becomes oppression when one can't stop
        I have become a slave to it, and though it hasn't impacted my life yet, I must stop it before it does

        Still its hard :(


        Dawg, failed I didn't even realize till post nut clarity hit like a train wreck, Good grief one week of not goon to waste
        This is worse than I thought, my drive is way too strong, not to mention its makes chuzz(chopped huzz) way more attractive,
        and thats not bad, its just im more willing to try and get my way with them rather than actually have something meaningful.
        So ironically, its weird because corn supposedly makes u see women as less, but for me it kinda keeps me at bay since I dont overdo it???
        So, for example since I gooned, I am more at bay and not just so horny as to just see them as means to quench my thirst???
        Idk its weird, now that I failed, I feel very very dissapointed I swore it was last time, and I failed, but now I feel a bit better
        more relaxed and not so crazy. But still i feel awful for failing, aaaaaaaargggggg I feel the drowsyness seeping in. IT feels like im either
        too hyper and running around or too sleepyh

        */
    }
    return (
        <section className="container">
            {error ? (
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            ) : (
                products.length === 0 ? (
                    <Alert color="warning" isOpen={visible} toggle={onDismiss}>
                        <h4 className="alert-heading">Sorry...</h4>
                        No products found.
                    </Alert>
                ) : (
                    <div className="row">
                        {products.map(product => (
                            <div className="col-md-4 mb-4" key={product._id}>
                                <ProductItem
                                    product={product}
                                    actionButtons={showActionButtons(product)}
                                />
                            </div>
                        ))}
                    </div>
                )
            )}
        </section>
    );
}

export default withRouter(ListProducts);