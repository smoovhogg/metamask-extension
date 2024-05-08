import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getWeightedPermissions } from '../../../../helpers/utils/permission';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import PermissionCell from '../../permission-cell';
import { Box } from '../../../component-library';
import { getSnapsMetadata } from '../../../../selectors';
import { getSnapName } from '../../../../helpers/utils/util';

export default function SnapPermissionsList({
  snapId,
  snapName,
  permissions,
  connections,
  showOptions,
}) {
  const t = useI18nContext();
  const snapsMetadata = useSelector(getSnapsMetadata);
  const permissionsToShow = {
    ...permissions,
    connection_permission: connections ?? {},
  };

  return (
    <Box className="snap-permissions-list">
      {getWeightedPermissions({
        t,
        permissions: permissionsToShow,
        subjectName: snapName,
        getSubjectName: getSnapName(snapsMetadata),
      }).map((permission, index) => {
        return (
          <PermissionCell
            snapId={snapId}
            permissionName={permission.permissionName}
            title={permission.label}
            description={permission.description}
            weight={permission.weight}
            avatarIcon={permission.leftIcon}
            dateApproved={permission?.permissionValue?.date}
            key={`${permission.permissionName}-${index}`}
            showOptions={showOptions}
            connection={permission.connection}
          />
        );
      })}
    </Box>
  );
}

SnapPermissionsList.propTypes = {
  snapId: PropTypes.string.isRequired,
  snapName: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  connections: PropTypes.object.isRequired,
  showOptions: PropTypes.bool,
};
