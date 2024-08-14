import { ref as dbRef, push, get, update, set, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase-config';

// CREATE

export const createBeer = async (beer) => {
    try {
        const beerRef = push(dbRef(db, 'beers'));
        const beerId = beerRef.key;
        const imageUrl = beer.imageFile ? await uploadBeerImage(beer.imageFile, beerId) : null;
        const newBeer = {
            id: beerId,
            name: beer.name,
            alc: beer.alc,
            type: beer.type,
            producer: beer.producer,
            origin: beer.origin,
            description: beer.description,
            imageUrl,
            averageRating: 0,
            createdAt: new Date().toISOString(),
        };
        await set(beerRef, newBeer);
        return beerId;
    } catch (error) {
        console.error('Error creating beer:', error);
        throw new Error('Failed to create beer');
    }
};

export const uploadBeerImage = async (file, beerId) => {
    try {
        const imageRef = storageRef(storage, `beers/${beerId}/${file.name}`);
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);
        return imageUrl;
    } catch (error) {
        console.error('Error uploading beer image:', error);
        throw new Error('Failed to upload beer image');
    }
};

// RETRIEVE

export const getAllBeers = async () => {
    try {
        const beersRef = dbRef(db, 'beers');
        const snapshot = await get(beersRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val());
    } catch (error) {
        console.error('Error fetching all beers:', error);
        throw new Error('Failed to retrieve beers');
    }
};

export const getBeerById = async (beerId) => {
    try {
        const beerRef = dbRef(db, `beers/${beerId}`);
        const snapshot = await get(beerRef);
        if (!snapshot.exists()) {
            return null;
        }
        return snapshot.val();
    } catch (error) {
        console.error('Error fetching beer by ID:', error);
        throw new Error('Failed to retrieve beer');
    }
};

export const getBeerRating = async (beerId) => {
    try {
        const beer = await getBeerById(beerId);
        return beer ? beer.averageRating : null;
    } catch (error) {
        console.error('Error fetching beer rating:', error);
        throw new Error('Failed to retrieve beer rating');
    }
};

export const getBeerRatingByUser = async (beerId, username) => {
    try {
        const beerRef = dbRef(db, `beers/${beerId}/ratings/${username}`);
        const snapshot = await get(beerRef);
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return 0;
    } catch (error) {
        console.error('Error fetching beer rating by username:', error);
        throw new Error('Failed to retrieve beer rating by username');
    }
};

// UPDATE

export const editBeer = async (beerId, updatedData, newImageFile) => {
    try {
        const beerRef = dbRef(db, `beers/${beerId}`);
        const snapshot = await get(beerRef);
        if (!snapshot.exists()) {
            throw new Error('Beer not found');
        }
        let imageUrl = snapshot.val().imageUrl;
        if (newImageFile) {
            if (imageUrl) {
                const oldImageRef = storageRef(storage, imageUrl);
                await deleteObject(oldImageRef);
            }
            imageUrl = await uploadBeerImage(newImageFile, beerId);
        }
        const updatedBeer = {
            ...snapshot.val(),
            ...updatedData,
            imageUrl,
            updatedAt: new Date().toISOString(),
        };
        await update(beerRef, updatedBeer);
        return updatedBeer;
    } catch (error) {
        console.error('Error updating beer:', error);
        throw new Error('Failed to update beer');
    }
};

export const rateBeer = async (beerId, username, rating) => {
    try {
        const beerRef = dbRef(db, `beers/${beerId}`);
        const snapshot = await get(beerRef);
        if (!snapshot.exists()) {
            throw new Error('Beer not found');
        }
        const beerData = snapshot.val();
        const ratings = beerData.ratings || {};

        ratings[username] = rating;
        const totalRatings = Object.values(ratings).reduce((acc, curr) => acc + curr, 0);
        const averageRating = totalRatings / Object.keys(ratings).length;
        const updatedBeer = {
            ...beerData,
            ratings,
            averageRating,
        };
        await update(beerRef, updatedBeer);
        return averageRating;
    } catch (error) {
        console.error('Error rating beer:', error);
        throw new Error('Failed to rate beer');
    }
};


// DELETE

export const deleteBeer = async (beerId) => {
    try {
        const beerRef = dbRef(db, `beers/${beerId}`);
        const snapshot = await get(beerRef);
        if (!snapshot.exists()) {
            throw new Error('Beer not found');
        }
        const beerData = snapshot.val();
        if (beerData.imageUrl) {
            const imageRef = storageRef(storage, beerData.imageUrl);
            await deleteObject(imageRef);
        }
        await remove(beerRef);
    } catch (error) {
        console.error('Error deleting beer:', error);
        throw new Error('Failed to delete beer');
    }
};
