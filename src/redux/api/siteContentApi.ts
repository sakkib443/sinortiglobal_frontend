import { baseApi } from './baseApi';

export const siteContentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Public: get site content
        getSiteContent: builder.query({
            query: () => '/site-content',
            providesTags: ['SiteContent'],
        }),

        // Admin: full update
        updateSiteContent: builder.mutation({
            query: (data) => ({
                url: '/site-content',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['SiteContent'],
        }),

        // Admin: update specific section
        updateSiteSection: builder.mutation({
            query: ({ section, data }) => ({
                url: `/site-content/${section}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['SiteContent'],
        }),
    }),
});

export const {
    useGetSiteContentQuery,
    useUpdateSiteContentMutation,
    useUpdateSiteSectionMutation,
} = siteContentApi;
