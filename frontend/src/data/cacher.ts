interface ICachedData {
    timestamp: number;
    data: any;
}

export enum CacheDuration {
    fifteenMinutes = 1000 * 60 * 15,
    oneHour = 1000 * 60 * 60,
    sixHours = 1000 * 60 * 60 * 6,
    oneDay = 1000 * 60 * 60 * 24
}

/**
 * Class used to add a caching layer in function calls.
 * Elements are cached for 6 hours.
 */
export class Cacher {
    /**
     * Fetches the data and caches it locally, so the next time
     * it will be readily available.
     * @param key A unique identifier for this endpoint (you can use the function name)
     * @param f The function to call in case of cache miss
     */
    public static async fetchData<T>(
        key: string,
        f: () => Promise<T>,
        cacheDuration: CacheDuration = CacheDuration.sixHours,
        refreshCache: boolean = false
    ): Promise<T> {
        if (!refreshCache) {
            const cachedData = this.fetchCachedData(key, cacheDuration);
            if (cachedData) return cachedData;
        }

        console.debug(`Cache miss, retrieving data for ${key}`);
        const fetchedData = await f();
        this.storeData(key, fetchedData);
        return fetchedData;
    }

    private static storeData(key: string, data: any): void {
        const cachedData: ICachedData = { timestamp: Date.now(), data };
        window.localStorage.setItem(key, JSON.stringify(cachedData));
    }

    private static fetchCachedData(key: string, cacheDuration: CacheDuration): any | undefined {
        const cache = window.localStorage.getItem(key);
        if (!cache) return;

        const maxTimestamp = cacheDuration;
        const cachedData = JSON.parse(cache);
        if (Date.now() - cachedData.timestamp > maxTimestamp) return;

        return cachedData.data;
    }
}
