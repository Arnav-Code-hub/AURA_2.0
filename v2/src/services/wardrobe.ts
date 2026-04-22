import { db, storage } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface WardrobeItem {
    id?: string;
    userId: string;
    imageUrl: string;
    name: string; // e.g. "Blue Denim Jacket"
    category: string; // e.g. "Outerwear"
    tags: string[]; // e.g. ["Casual", "Blue", "Denim"]
    /** Optional link to a partner brand (Firestore sponsor id). */
    sponsorId?: string;
    createdAt?: any;
}

const COLLECTION_NAME = "wardrobe";

export const WardrobeService = {
    /**
     * Add a new item to the user's wardrobe
     */
    async addItem(userId: string, file: File, metadata: Omit<WardrobeItem, "id" | "userId" | "imageUrl" | "createdAt">) {
        try {
            // 1. Upload Image
            const storageRef = ref(storage, `wardrobe/${userId}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Save Metadata to Firestore
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                userId,
                imageUrl: downloadURL,
                ...metadata,
                createdAt: serverTimestamp(),
            });

            return { id: docRef.id, ...metadata, imageUrl: downloadURL };
        } catch (error) {
            console.error("Error adding item:", error);
            throw error;
        }
    },

    /**
     * Get all items for a specific user
     */
    async getUserItems(userId: string) {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as WardrobeItem[];
        } catch (error) {
            console.error("Error fetching items:", error);
            throw error;
        }
    },

    /**
     * Delete an item
     */
    async deleteItem(itemId: string, imageUrl: string) {
        try {
            // 1. Delete Firestore Doc
            await deleteDoc(doc(db, COLLECTION_NAME, itemId));

            // 2. Delete Storage Image (Optional but recommended)
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef).catch(err => console.log("Image delete failed (might verify later)", err));

            return true;
        } catch (error) {
            console.error("Error deleting item:", error);
            throw error;
        }
    }
};
