import { ref, push, get, update } from 'firebase/database';
import { db } from '../config/firebase-config';

export const addSurvey = async (survey) => {
    const surveyRef = ref(db, 'surveys');
    const newSurveyRef = push(surveyRef);
    await update(newSurveyRef, { ...survey, id: newSurveyRef.key });
};

export const getAllSurveys = async () => {
    const snapshot = await get(ref(db, 'surveys'));
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val());
};

export const getSurvey = async (id) => {
    const snapshot = await get(ref(db, `surveys/${id}`));
    if (!snapshot.exists()) throw new Error('Survey not found');
    return snapshot.val();
};

export const rateChoice = async (surveyId, choiceId, userId, rating) => {
    const ratingRef = ref(
        db,
        `surveys/${surveyId}/choices/${choiceId}/ratings/${userId}`
    );
    await update(ratingRef, { rating });

    // Update average rating (you may want to compute this on the backend)
    const choiceRef = ref(db, `surveys/${surveyId}/choices/${choiceId}`);
    const snapshot = await get(choiceRef);
    const choice = snapshot.val();

    const ratings = Object.values(choice.ratings ?? {});
    const averageRating =
    ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await update(choiceRef, { averageRating });
};
