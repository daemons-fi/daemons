interface ICachedData {
    timestamp: number;
    data: any;
}

/**
 * Enum representing the maximum age of a piece of information
 * before it is considered stale and a new function call is performed.
 */
export enum CacheDuration {
    zero = 0,
    oneHour = 1000 * 60 * 60,
    sixHours = 1000 * 60 * 60 * 6,
    oneDay = 1000 * 60 * 60 * 24
}

class LocalStorage {
    private storage: { [key: string]: any } = {};

    public setItem = (key: string, value: any) => this.storage[key] = value;
    public getItem = (key: string) => this.storage[key] ?? null;
}

/**
 * Class used to add a caching layer in function calls.
 * Elements are cached by default for 6 hours, but it can be specified.
 */
export class ServerCacher {
    private static localStorage = new LocalStorage();

    /**
     * Fetches the data and caches it locally, so the next time
     * it will be readily available.
     * @param key A unique identifier for this endpoint (you can use the function name)
     * @param f The function to call in case of cache miss
     */
    public static async fetchData<T>(
        key: string,
        f: () => Promise<T>,
        cacheDuration: CacheDuration = CacheDuration.sixHours
    ): Promise<T> {
        const cachedData = this.fetchCachedData(key, cacheDuration);
        if (cachedData) return cachedData;

        console.debug(`Cache miss, retrieving data for ${key}`);
        const fetchedData = await f();
        this.storeData(key, fetchedData);
        return fetchedData;
    }

    private static storeData(key: string, data: any): void {
        const cachedData: ICachedData = { timestamp: Date.now(), data };
        ServerCacher.localStorage.setItem(key, cachedData);
    }

    private static fetchCachedData(key: string, cacheDuration: CacheDuration): any | undefined {
        const cache = ServerCacher.localStorage.getItem(key);
        if (!cache) return;

        const maxTimestamp = cacheDuration;
        const cachedData = cache;
        if (Date.now() - cachedData.timestamp > maxTimestamp) return;

        return cachedData.data;
    }
}
