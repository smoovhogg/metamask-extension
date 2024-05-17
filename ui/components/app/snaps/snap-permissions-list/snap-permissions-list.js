import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { SubjectType } from '@metamask/permission-controller';
import { getWeightedPermissions } from '../../../../helpers/utils/permission';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import PermissionCell from '../../permission-cell';
import {
  AvatarBase,
  AvatarBaseSize,
  AvatarFavicon,
  AvatarFaviconSize,
  Box,
  IconSize,
  Text,
} from '../../../component-library';
import {
  getMultipleTargetsSubjectMetadata,
  getSnapsMetadata,
} from '../../../../selectors';
import {
  getAvatarFallbackLetter,
  getSnapName,
} from '../../../../helpers/utils/util';
import {
  AlignItems,
  BackgroundColor,
  Display,
  FontWeight,
  JustifyContent,
  TextColor,
  TextVariant,
} from '../../../../helpers/constants/design-system';

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
  const targetSubjectsMetadata = useSelector((state) =>
    getMultipleTargetsSubjectMetadata(state, connections),
  );

  const showPermissionCell = (permission, index) => {
    if (permission.connection) {
      const targetSubjectMetadata =
        targetSubjectsMetadata[permission.connection];
      let title = permission.label;
      let { description } = permission;

      if (targetSubjectMetadata?.subjectType === SubjectType.Snap) {
        title = t('snapConnectTo', [
          <Text
            key="connectToMain"
            fontWeight={FontWeight.Medium}
            variant={TextVariant.inherit}
            color={TextColor.inherit}
          >
            {targetSubjectMetadata.name}
          </Text>,
        ]);
        description = t('snapConnectionPermissionDescription', [
          <Text
            key={`permissionSubject_${permission.subjectName}`}
            fontWeight={FontWeight.Medium}
            variant={TextVariant.inherit}
            color={TextColor.inherit}
          >
            {permission.subjectName}
          </Text>,
          <Text
            key={`permissionSubjectDescription_${targetSubjectMetadata.name}`}
            fontWeight={FontWeight.Medium}
            variant={TextVariant.inherit}
            color={TextColor.inherit}
          >
            {targetSubjectMetadata.name}
          </Text>,
        ]);
      }

      const faviconUrl = targetSubjectMetadata?.iconUrl;

      const permissionIcon = faviconUrl ? (
        <AvatarFavicon
          backgroundColor={BackgroundColor.backgroundAlternative}
          size={AvatarFaviconSize.Md}
          iconProps={{
            size: IconSize.Sm,
          }}
          src={faviconUrl}
          name={permission.connection}
        />
      ) : (
        <AvatarBase
          size={AvatarBaseSize.Md}
          display={Display.Flex}
          alignItems={AlignItems.center}
          justifyContent={JustifyContent.center}
          color={TextColor.textAlternative}
          style={{ borderWidth: '0px' }}
          backgroundColor={BackgroundColor.backgroundAlternative}
        >
          {getAvatarFallbackLetter(permission.connectionName)}
        </AvatarBase>
      );

      return (
        <PermissionCell
          snapId={snapId}
          permissionName={permission.permissionName}
          title={title}
          description={description}
          weight={permission.weight}
          avatarIcon={permissionIcon}
          dateApproved={permission?.permissionValue?.date}
          key={`${permission.permissionName}-${index}`}
          showOptions={showOptions}
          connection={permission.connection}
        />
      );
    }

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
  };

  return (
    <Box className="snap-permissions-list">
      {getWeightedPermissions({
        t,
        permissions: permissionsToShow,
        subjectName: snapName,
        getSubjectName: getSnapName(snapsMetadata),
      }).map((permission, index) => showPermissionCell(permission, index))}
    </Box>
  );
}

SnapPermissionsList.propTypes = {
  snapId: PropTypes.string.isRequired,
  snapName: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  connections: PropTypes.object,
  showOptions: PropTypes.bool,
};
