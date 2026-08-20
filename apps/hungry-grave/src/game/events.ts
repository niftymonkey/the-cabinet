/**
 * The event vocabulary the sim reports out (tracer plan section 3). Payloads
 * carry values, never entity references: entities are pooled and mutated in
 * place, so a held reference is a recycled slot by the time a sound or an
 * instrument reads it.
 *
 * The stub sim reports nothing, so the union is empty. Each rule dispatch adds
 * its own members here as it lands.
 */
export type SimEvent = never;
