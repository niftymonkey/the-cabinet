# Traits, pools and generation rules live in data, not code

Every axis, every trait pool, every drain rate and every rule the generator follows is data the
generator reads, never logic written into it. The Halloween build ships a deliberately dumb
generator on top of that data.

This exists so the design can keep moving. Improving the generator is the main thing this project
has to grow into over the year after the jam, and the numbers are all pending what the solver
measures, so the generator has to be replaceable without touching anything around it.
