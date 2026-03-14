import {useEffect, useMemo, useState} from 'react';
import {companyApi} from '../api';
import type {CompanyUserResponseDto} from '../types/api';
import {PositionPermissions} from '../types/api';

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

function hasPermission(permissions: number, flag: PositionPermissions): boolean {
    return (permissions & flag) === flag;
}

export function useCompanyPermissions(companyId: number) {
    const [companyUser, setCompanyUser] = useState<CompanyUserResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!Number.isFinite(companyId) || companyId <= 0) {
            setCompanyUser(null);
            setErrorMessage('Invalid company ID.');
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setErrorMessage(null);

        void companyApi
            .getMyCompanyUser(companyId)
            .then((response) => {
                if (!isMounted) return;
                const isSuccess = response.IsSuccess ?? response.isSuccess ?? false;
                const data = response.Data ?? response.data;
                if (!isSuccess || !data) {
                    setCompanyUser(null);
                    setErrorMessage(response.Message ?? response.message ?? 'Failed to load user permissions.');
                    return;
                }
                setCompanyUser(data);
            })
            .catch((error) => {
                if (!isMounted) return;
                setCompanyUser(null);
                setErrorMessage(getErrorMessage(error, 'Failed to load user permissions.'));
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [companyId]);

    const canCreateDepartment = useMemo(() =>
            !!companyUser && hasPermission(companyUser.permissions, PositionPermissions.CreateDepartment),
        [companyUser]
    );

    const canCreatePosition = useMemo(() =>
            !!companyUser && hasPermission(companyUser.permissions, PositionPermissions.CreatePosition),
        [companyUser]
    );

    const canCreateChat = useMemo(() =>
            !!companyUser && hasPermission(companyUser.permissions, PositionPermissions.CreateChat),
        [companyUser]
    );

    return {companyUser, canCreateDepartment, canCreatePosition, canCreateChat, isLoading, errorMessage};
}