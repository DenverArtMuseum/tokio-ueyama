---
layout: page
order: 8
classes:
  - copyright-page
outputs:
  - epub
  - pdf
toc: false
---

{% copyright %}

{% if publication.identifier.isbn %}
ISBN: {{ publication.identifier.isbn }}
{% endif %}
