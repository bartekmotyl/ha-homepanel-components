# Project Overview

This is a library of custom components for Home Assistant dashboards.
The components are designed in an old "metro" style (flat).

# Architecture

- React
- Tailwind CSS
- WebComponents

The components use bindings to objects exposed by Home Assistant (especially the `hass` object)

Because `hass` instance changes very often (on each change of state of any device Home Assistant assigns new instance of the `hass` object) memoization is used to avoid rerendering too often. Most of card have sub-component called `*View` that is responsible for pure rendering based on simple data passed as parameters. The actual logic is located in the outer component, that analyzes `hass` state and prepares data to be displayed.

# Coding Standards

- Use TypeScript strict mode
- Prefer functional components
