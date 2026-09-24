/* src/repositories/request.repository.js (countByCategory)
   `join` is intentionally not destructured: the manager branch builds its
   own join because the filter has to land on the requests rows.
*/
const { where, params } = this.scopeFor(user);