WITH plz_version AS (
    SELECT version_id, kcid, bcid
    FROM grids
    WHERE plz='91301'
)
SELECT version_id, kcid, bcid, grid
FROM grids 
WHERE version_id=(SELECT version_id FROM plz_version LIMIT 1)