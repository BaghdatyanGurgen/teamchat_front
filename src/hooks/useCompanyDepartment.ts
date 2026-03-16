import { useCallback, useEffect, useState } from 'react';
import { companyApi } from '../api';
import type { CreateCompanyDepartmentResponseDto } from '../types/api';

export function useCompanyDepartments(companyId: number) {
    const [departments, setDepartments] = useState<CreateCompanyDepartmentResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!Number.isFinite(companyId) || companyId <= 0) {
            setDepartments([]);
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);

        void companyApi.getDepartments(companyId)
            .then((response) => {
                if (!isMounted) return;
                setDepartments(response.Data ?? response.data ?? []);
            })
            .catch(() => {
                if (isMounted) setDepartments([]);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => { isMounted = false; };
    }, [companyId]);

    const addDepartment = useCallback((dept: CreateCompanyDepartmentResponseDto) => {
        setDepartments((prev) => prev.some((d) => d.id === dept.id) ? prev : [...prev, dept]);
    }, []);

    return { departments, isLoading, addDepartment };
}