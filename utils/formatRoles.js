/**
 * Replaces all {roleNames} with a role mention
 * @param content
 * @param roles
 * @returns string
 */
function formatRoles(content, roles) {
  content = content.replace('{everyone}', '@everyone');
  content = content.replace('{here}', '@here');

  roles.forEach((r) => {
    if (r.name !== '@everyone') {
      content = content.replace(`{${r.name}}`, `<@&${r.id}>`);
    }
  });

  return content;
}

module.exports = formatRoles;
