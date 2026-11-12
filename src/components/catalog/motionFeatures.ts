import { domMax } from 'framer-motion';

/**
 * Loaded lazily by `LazyMotion` so layout-animation code stays out of the
 * critical bundle; the grid renders (and hydrates) fine before it arrives.
 */
export default domMax;
