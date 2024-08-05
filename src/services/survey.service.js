import { ref as dbRef, push, get, update, set } from 'firebase/database';
import { db, storage } from '../config/firebase-config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// export const addSurvey = async (survey) => {
//     const surveyRef = ref(db, 'surveys');
//     const newSurveyRef = push(surveyRef);
//     await update(newSurveyRef, { ...survey, id: newSurveyRef.key });
// };

export const getAllSurveys = async () => {
    const snapshot = await get(dbRef(db, 'surveys'));
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};

export const getSurvey = async (id) => {
    const snapshot = await get(dbRef(db, `surveys/${id}`));
    if (!snapshot.exists()) throw new Error('Survey not found');
    return snapshot.val();
};

export const rateChoice = async (surveyId, choiceId, userId, rating) => {
    const ratingRef = dbRef(
        db,
        `surveys/${surveyId}/choices/${choiceId}/ratings/${userId}`
    );
    await update(ratingRef, { rating });

    const choiceRef = dbRef(db, `surveys/${surveyId}/choices/${choiceId}`);
    const snapshot = await get(choiceRef);
    const choice = snapshot.val();

    const ratings = Object.values(choice.ratings ?? {});
    const averageRating =
    ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await update(choiceRef, { averageRating });
};

export const getAverageRating = async (surveyId, choiceId) => {
    const snapshot = await get(
        dbRef(db, `surveys/${surveyId}/choices/${choiceId}/ratings`)
    );
    const ratings = snapshot.val();

    if (!ratings) return 0;

    const total = Object.values(ratings).reduce((acc, score) => acc + score, 0);
    return total / Object.values(ratings).length;
};

export const addRating = async (surveyId, choiceId, userId, rating) => {
    await set(
        dbRef(db, `surveys/${surveyId}/choices/${choiceId}/ratings/${userId}`),
        rating
    );
};


export const updateSurvey = async (id, updatedSurvey) => {
    const surveyRef = dbRef(db, `surveys/${id}`);
    await update(surveyRef, updatedSurvey);
};

export const uploadImage = async (file) => {
    const fileRef = storageRef(storage, `survey-images/${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
};

export const addSurvey = async (survey) => {
    const surveyRef = dbRef(db, 'surveys');
    const newSurveyRef = push(surveyRef);

    const choicesWithImageUrls = await Promise.all(
        survey.choices.map(async (choice) => {
            const imageUrl = await uploadImage(choice.image);
            return { ...choice, image: imageUrl };
        })
    );

    await update(newSurveyRef, { ...survey, choices: choicesWithImageUrls, id: newSurveyRef.key });
};