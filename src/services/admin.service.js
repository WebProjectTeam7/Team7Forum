import { get, ref, query, equalTo, orderByChild, update, remove } from 'firebase/database';
import { db } from '../config/firebase-config';
import { MILLISECONDS_IN_AN_HOUR, MILLISECONDS_IN_A_DAY } from '../common/components.constants';
import { getThreadById } from './thread.service';
import { getReplyById } from './reply.service';

// BAN

export const banUser = async (uid, days) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const userId = Object.keys(snapshot.val())[0];
        const userData = Object.values(snapshot.val())[0];
        if (userData.role === 'admin') {
            throw new Error('Admins cannot be banned.');
        }

        const banEndDate = new Date();
        banEndDate.setDate(banEndDate.getDate() + days);
        const updatedUserData = { ...userData, isBanned: true, banEndDate: banEndDate.toISOString() };
        await update(ref(db, `users/${userId}`), updatedUserData);

        return updatedUserData;
    }
    throw new Error('User not found');
};

export const unbanUser = async (uid) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const userId = Object.keys(snapshot.val())[0];
        await update(ref(db, `users/${userId}`), { isBanned: false, banEndDate: null });
    }
};

export const handleBanUser = async (uid, banDuration) => {
    if (!banDuration) {
        throw new Error('Please enter a valid number of days.');
    }
    await banUser(uid, parseInt(banDuration));
};

export const isUserBanned = async (uid) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const userData = Object.values(snapshot.val())[0];
        if (userData.banExpiration) {
            const banEndDate = new Date(userData.banExpiration);
            const currentDate = new Date();
            if (currentDate < banEndDate) {
                return true;
            }

            const userId = Object.keys(snapshot.val())[0];
            await update(ref(db, `users/${userId}`), { banExpiration: null });
            return false;

        }
    }
    return false;
};

export const getRemainingBanTime = (banEndDate) => {
    const now = new Date();
    const end = new Date(banEndDate);
    const diff = end - now;
    if (diff <= 0) return 'Ban has expired';

    const days = Math.floor(diff / MILLISECONDS_IN_A_DAY);
    const hours = Math.floor((diff % MILLISECONDS_IN_A_DAY) / MILLISECONDS_IN_AN_HOUR);
    return `${days} days ${hours} hours`;
};

// REPORTS

export const getReports = async () => {
    try {
        const reportsRef = ref(db, 'reports');
        const snapshot = await get(reportsRef);
        if (!snapshot.exists()) {
            return [];
        }
        const reports = await Promise.all(Object.entries(snapshot.val()).map(async ([id, report]) => {
            let reportedUser = null;

            try {
                if (report.type === 'thread') {
                    const thread = await getThreadById(report.targetId);
                    reportedUser = thread.authorName;
                } else if (report.type === 'reply') {
                    const reply = await getReplyById(report.targetId);
                    reportedUser = reply.author;
                }
            } catch (error) {
                console.error(`Error fetching reported user for report ID ${id}:`, error);
            }

            return {
                id,
                reportedUser,
                ...report,
            };
        }));

        return reports;
    } catch (error) {
        console.error('Error fetching reports:', error);
    }
};

export const deleteReport = async (reportId) => {
    try {
        const reportRef = ref(db, `reports/${reportId}`);
        await remove(reportRef);
        alert('Report deleted')
    } catch (error) {
        console.error('Error deleting report:', error);
    }
};