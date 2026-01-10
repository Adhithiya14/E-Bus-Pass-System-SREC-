// Centralized API Helper for Robustness
export const safeFetch = async (url, options = {}) => {
    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            // Try to parse error message
            let errorMessage = `HTTP Error ${res.status}`;
            try {
                const errorData = await res.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
        }
        return await res.json();
    } catch (err) {
        console.error(`API Call Failed [${url}]:`, err);
        throw err;
    }
};
