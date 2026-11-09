// 和 eventemitter3@5 接口兼容的最小实现（Poki 版打包用，代替从 CDN 加载 eventemitter3）
class EventEmitter {
  constructor() { this._events = new Map(); }
  _list(e) { let l = this._events.get(e); if (!l) { l = []; this._events.set(e, l); } return l; }
  on(e, fn, ctx) { this._list(e).push({ fn, ctx, once: false }); return this; }
  addListener(e, fn, ctx) { return this.on(e, fn, ctx); }
  once(e, fn, ctx) { this._list(e).push({ fn, ctx, once: true }); return this; }
  removeListener(e, fn, ctx, once) {
    const l = this._events.get(e); if (!l) return this;
    if (!fn) { this._events.delete(e); return this; }
    const keep = l.filter(x => x.fn !== fn || (once && !x.once) || (ctx && x.ctx !== ctx));
    if (keep.length) this._events.set(e, keep); else this._events.delete(e);
    return this;
  }
  off(e, fn, ctx, once) { return this.removeListener(e, fn, ctx, once); }
  removeAllListeners(e) { if (e === undefined) this._events.clear(); else this._events.delete(e); return this; }
  emit(e, ...args) {
    const l = this._events.get(e); if (!l || !l.length) return false;
    for (const x of l.slice()) { if (x.once) this.removeListener(e, x.fn, undefined, true); x.fn.apply(x.ctx === undefined ? this : x.ctx, args); }
    return true;
  }
  listeners(e) { return (this._events.get(e) || []).map(x => x.fn); }
  listenerCount(e) { return (this._events.get(e) || []).length; }
  eventNames() { return [...this._events.keys()]; }
}
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.prefixed = false;
export { EventEmitter };
export default EventEmitter;
