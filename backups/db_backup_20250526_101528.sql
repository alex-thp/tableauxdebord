PGDMP          
            }         
   mydatabase    16.9 (Debian 16.9-1.pgdg120+1)    16.9 (Debian 16.9-1.pgdg120+1) M    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16384 
   mydatabase    DATABASE     u   CREATE DATABASE mydatabase WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE mydatabase;
                myuser    false            �            1259    24611 
   permission    TABLE     a   CREATE TABLE public.permission (
    id integer NOT NULL,
    name character varying NOT NULL
);
    DROP TABLE public.permission;
       public         heap    myuser    false            �            1259    24610    permission_id_seq    SEQUENCE     �   CREATE SEQUENCE public.permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.permission_id_seq;
       public          myuser    false    221            �           0    0    permission_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.permission_id_seq OWNED BY public.permission.id;
          public          myuser    false    220            �            1259    40994    permission_roles_role    TABLE     r   CREATE TABLE public.permission_roles_role (
    "permissionId" integer NOT NULL,
    "roleId" integer NOT NULL
);
 )   DROP TABLE public.permission_roles_role;
       public         heap    myuser    false            �            1259    16395    permissions    TABLE     f   CREATE TABLE public.permissions (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);
    DROP TABLE public.permissions;
       public         heap    myuser    false            �            1259    16394    permissions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.permissions_id_seq;
       public          myuser    false    218            �           0    0    permissions_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;
          public          myuser    false    217            �            1259    24622    role    TABLE     [   CREATE TABLE public.role (
    id integer NOT NULL,
    name character varying NOT NULL
);
    DROP TABLE public.role;
       public         heap    myuser    false            �            1259    24621    role_id_seq    SEQUENCE     �   CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.role_id_seq;
       public          myuser    false    223            �           0    0    role_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;
          public          myuser    false    222            �            1259    16403    role_permissions    TABLE     k   CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);
 $   DROP TABLE public.role_permissions;
       public         heap    myuser    false            �            1259    41001    role_permissions_permission    TABLE     x   CREATE TABLE public.role_permissions_permission (
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL
);
 /   DROP TABLE public.role_permissions_permission;
       public         heap    myuser    false            �            1259    41008    role_users_user    TABLE     f   CREATE TABLE public.role_users_user (
    "roleId" integer NOT NULL,
    "userId" integer NOT NULL
);
 #   DROP TABLE public.role_users_user;
       public         heap    myuser    false            �            1259    16386    roles    TABLE     `   CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);
    DROP TABLE public.roles;
       public         heap    myuser    false            �            1259    16385    roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.roles_id_seq;
       public          myuser    false    216            �           0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public          myuser    false    215            �            1259    24633    user    TABLE     �   CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying NOT NULL,
    "passwordHash" character varying NOT NULL
);
    DROP TABLE public."user";
       public         heap    myuser    false            �            1259    24632    user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.user_id_seq;
       public          myuser    false    225            �           0    0    user_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;
          public          myuser    false    224            �            1259    24643    user_roles_role    TABLE     f   CREATE TABLE public.user_roles_role (
    "userId" integer NOT NULL,
    "roleId" integer NOT NULL
);
 #   DROP TABLE public.user_roles_role;
       public         heap    myuser    false            �           2604    24614    permission id    DEFAULT     n   ALTER TABLE ONLY public.permission ALTER COLUMN id SET DEFAULT nextval('public.permission_id_seq'::regclass);
 <   ALTER TABLE public.permission ALTER COLUMN id DROP DEFAULT;
       public          myuser    false    221    220    221            �           2604    16398    permissions id    DEFAULT     p   ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);
 =   ALTER TABLE public.permissions ALTER COLUMN id DROP DEFAULT;
       public          myuser    false    217    218    218            �           2604    24625    role id    DEFAULT     b   ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);
 6   ALTER TABLE public.role ALTER COLUMN id DROP DEFAULT;
       public          myuser    false    223    222    223            �           2604    16389    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public          myuser    false    216    215    216            �           2604    24636    user id    DEFAULT     d   ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);
 8   ALTER TABLE public."user" ALTER COLUMN id DROP DEFAULT;
       public          myuser    false    225    224    225            u          0    24611 
   permission 
   TABLE DATA           .   COPY public.permission (id, name) FROM stdin;
    public          myuser    false    221   �[       {          0    40994    permission_roles_role 
   TABLE DATA           I   COPY public.permission_roles_role ("permissionId", "roleId") FROM stdin;
    public          myuser    false    227   �[       r          0    16395    permissions 
   TABLE DATA           /   COPY public.permissions (id, name) FROM stdin;
    public          myuser    false    218   �[       w          0    24622    role 
   TABLE DATA           (   COPY public.role (id, name) FROM stdin;
    public          myuser    false    223   �[       s          0    16403    role_permissions 
   TABLE DATA           B   COPY public.role_permissions (role_id, permission_id) FROM stdin;
    public          myuser    false    219   \       |          0    41001    role_permissions_permission 
   TABLE DATA           O   COPY public.role_permissions_permission ("roleId", "permissionId") FROM stdin;
    public          myuser    false    228   V\       }          0    41008    role_users_user 
   TABLE DATA           =   COPY public.role_users_user ("roleId", "userId") FROM stdin;
    public          myuser    false    229   s\       p          0    16386    roles 
   TABLE DATA           )   COPY public.roles (id, name) FROM stdin;
    public          myuser    false    216   �\       y          0    24633    user 
   TABLE DATA           ;   COPY public."user" (id, email, "passwordHash") FROM stdin;
    public          myuser    false    225   �\       z          0    24643    user_roles_role 
   TABLE DATA           =   COPY public.user_roles_role ("userId", "roleId") FROM stdin;
    public          myuser    false    226   O]       �           0    0    permission_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.permission_id_seq', 1, false);
          public          myuser    false    220            �           0    0    permissions_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.permissions_id_seq', 3, true);
          public          myuser    false    217            �           0    0    role_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.role_id_seq', 1, true);
          public          myuser    false    222            �           0    0    roles_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.roles_id_seq', 8, true);
          public          myuser    false    215            �           0    0    user_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.user_id_seq', 1, true);
          public          myuser    false    224            �           2606    24618 )   permission PK_3b8b97af9d9d8807e41e6f48362 
   CONSTRAINT     i   ALTER TABLE ONLY public.permission
    ADD CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY (id);
 U   ALTER TABLE ONLY public.permission DROP CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362";
       public            myuser    false    221            �           2606    41012 .   role_users_user PK_46403d6ce64cde119287c876ca3 
   CONSTRAINT     ~   ALTER TABLE ONLY public.role_users_user
    ADD CONSTRAINT "PK_46403d6ce64cde119287c876ca3" PRIMARY KEY ("roleId", "userId");
 Z   ALTER TABLE ONLY public.role_users_user DROP CONSTRAINT "PK_46403d6ce64cde119287c876ca3";
       public            myuser    false    229    229            �           2606    40998 4   permission_roles_role PK_534958b0063b8ad39335d7bcfd0 
   CONSTRAINT     �   ALTER TABLE ONLY public.permission_roles_role
    ADD CONSTRAINT "PK_534958b0063b8ad39335d7bcfd0" PRIMARY KEY ("permissionId", "roleId");
 `   ALTER TABLE ONLY public.permission_roles_role DROP CONSTRAINT "PK_534958b0063b8ad39335d7bcfd0";
       public            myuser    false    227    227            �           2606    24629 #   role PK_b36bcfe02fc8de3c57a8b2391c2 
   CONSTRAINT     c   ALTER TABLE ONLY public.role
    ADD CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY (id);
 O   ALTER TABLE ONLY public.role DROP CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2";
       public            myuser    false    223            �           2606    24647 .   user_roles_role PK_b47cd6c84ee205ac5a713718292 
   CONSTRAINT     ~   ALTER TABLE ONLY public.user_roles_role
    ADD CONSTRAINT "PK_b47cd6c84ee205ac5a713718292" PRIMARY KEY ("userId", "roleId");
 Z   ALTER TABLE ONLY public.user_roles_role DROP CONSTRAINT "PK_b47cd6c84ee205ac5a713718292";
       public            myuser    false    226    226            �           2606    41005 :   role_permissions_permission PK_b817d7eca3b85f22130861259dd 
   CONSTRAINT     �   ALTER TABLE ONLY public.role_permissions_permission
    ADD CONSTRAINT "PK_b817d7eca3b85f22130861259dd" PRIMARY KEY ("roleId", "permissionId");
 f   ALTER TABLE ONLY public.role_permissions_permission DROP CONSTRAINT "PK_b817d7eca3b85f22130861259dd";
       public            myuser    false    228    228            �           2606    24640 #   user PK_cace4a159ff9f2512dd42373760 
   CONSTRAINT     e   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);
 Q   ALTER TABLE ONLY public."user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760";
       public            myuser    false    225            �           2606    24620 )   permission UQ_240853a0c3353c25fb12434ad33 
   CONSTRAINT     f   ALTER TABLE ONLY public.permission
    ADD CONSTRAINT "UQ_240853a0c3353c25fb12434ad33" UNIQUE (name);
 U   ALTER TABLE ONLY public.permission DROP CONSTRAINT "UQ_240853a0c3353c25fb12434ad33";
       public            myuser    false    221            �           2606    24631 #   role UQ_ae4578dcaed5adff96595e61660 
   CONSTRAINT     `   ALTER TABLE ONLY public.role
    ADD CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE (name);
 O   ALTER TABLE ONLY public.role DROP CONSTRAINT "UQ_ae4578dcaed5adff96595e61660";
       public            myuser    false    223            �           2606    24642 #   user UQ_e12875dfb3b1d92d7d7c5377e22 
   CONSTRAINT     c   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);
 Q   ALTER TABLE ONLY public."user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22";
       public            myuser    false    225            �           2606    16402     permissions permissions_name_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);
 J   ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_name_key;
       public            myuser    false    218            �           2606    16400    permissions permissions_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_pkey;
       public            myuser    false    218            �           2606    16407 &   role_permissions role_permissions_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);
 P   ALTER TABLE ONLY public.role_permissions DROP CONSTRAINT role_permissions_pkey;
       public            myuser    false    219    219            �           2606    16393    roles roles_name_key 
   CONSTRAINT     O   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);
 >   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_name_key;
       public            myuser    false    216            �           2606    16391    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public            myuser    false    216            �           1259    24649    IDX_4be2f7adf862634f5f803d246b    INDEX     `   CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON public.user_roles_role USING btree ("roleId");
 4   DROP INDEX public."IDX_4be2f7adf862634f5f803d246b";
       public            myuser    false    226            �           1259    24648    IDX_5f9286e6c25594c6b88c108db7    INDEX     `   CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON public.user_roles_role USING btree ("userId");
 4   DROP INDEX public."IDX_5f9286e6c25594c6b88c108db7";
       public            myuser    false    226            �           1259    41000    IDX_7ec93d4fbf75b063f3ffd2646a    INDEX     f   CREATE INDEX "IDX_7ec93d4fbf75b063f3ffd2646a" ON public.permission_roles_role USING btree ("roleId");
 4   DROP INDEX public."IDX_7ec93d4fbf75b063f3ffd2646a";
       public            myuser    false    227            �           1259    40999    IDX_9f44b6228b173c7b9dfb8c6600    INDEX     l   CREATE INDEX "IDX_9f44b6228b173c7b9dfb8c6600" ON public.permission_roles_role USING btree ("permissionId");
 4   DROP INDEX public."IDX_9f44b6228b173c7b9dfb8c6600";
       public            myuser    false    227            �           1259    41014    IDX_a88fcb405b56bf2e2646e9d479    INDEX     `   CREATE INDEX "IDX_a88fcb405b56bf2e2646e9d479" ON public.role_users_user USING btree ("userId");
 4   DROP INDEX public."IDX_a88fcb405b56bf2e2646e9d479";
       public            myuser    false    229            �           1259    41006    IDX_b36cb2e04bc353ca4ede00d87b    INDEX     l   CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON public.role_permissions_permission USING btree ("roleId");
 4   DROP INDEX public."IDX_b36cb2e04bc353ca4ede00d87b";
       public            myuser    false    228            �           1259    41007    IDX_bfbc9e263d4cea6d7a8c9eb3ad    INDEX     r   CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON public.role_permissions_permission USING btree ("permissionId");
 4   DROP INDEX public."IDX_bfbc9e263d4cea6d7a8c9eb3ad";
       public            myuser    false    228            �           1259    41013    IDX_ed6edac7184b013d4bd58d60e5    INDEX     `   CREATE INDEX "IDX_ed6edac7184b013d4bd58d60e5" ON public.role_users_user USING btree ("roleId");
 4   DROP INDEX public."IDX_ed6edac7184b013d4bd58d60e5";
       public            myuser    false    229            �           2606    32802 .   user_roles_role FK_4be2f7adf862634f5f803d246b8    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_roles_role
    ADD CONSTRAINT "FK_4be2f7adf862634f5f803d246b8" FOREIGN KEY ("roleId") REFERENCES public.role(id);
 Z   ALTER TABLE ONLY public.user_roles_role DROP CONSTRAINT "FK_4be2f7adf862634f5f803d246b8";
       public          myuser    false    226    223    3263            �           2606    24650 .   user_roles_role FK_5f9286e6c25594c6b88c108db77    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_roles_role
    ADD CONSTRAINT "FK_5f9286e6c25594c6b88c108db77" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 Z   ALTER TABLE ONLY public.user_roles_role DROP CONSTRAINT "FK_5f9286e6c25594c6b88c108db77";
       public          myuser    false    3267    225    226            �           2606    41020 4   permission_roles_role FK_7ec93d4fbf75b063f3ffd2646a5    FK CONSTRAINT     �   ALTER TABLE ONLY public.permission_roles_role
    ADD CONSTRAINT "FK_7ec93d4fbf75b063f3ffd2646a5" FOREIGN KEY ("roleId") REFERENCES public.role(id);
 `   ALTER TABLE ONLY public.permission_roles_role DROP CONSTRAINT "FK_7ec93d4fbf75b063f3ffd2646a5";
       public          myuser    false    223    227    3263            �           2606    41015 4   permission_roles_role FK_9f44b6228b173c7b9dfb8c66003    FK CONSTRAINT     �   ALTER TABLE ONLY public.permission_roles_role
    ADD CONSTRAINT "FK_9f44b6228b173c7b9dfb8c66003" FOREIGN KEY ("permissionId") REFERENCES public.permission(id) ON UPDATE CASCADE ON DELETE CASCADE;
 `   ALTER TABLE ONLY public.permission_roles_role DROP CONSTRAINT "FK_9f44b6228b173c7b9dfb8c66003";
       public          myuser    false    227    221    3259            �           2606    41040 .   role_users_user FK_a88fcb405b56bf2e2646e9d4797    FK CONSTRAINT     �   ALTER TABLE ONLY public.role_users_user
    ADD CONSTRAINT "FK_a88fcb405b56bf2e2646e9d4797" FOREIGN KEY ("userId") REFERENCES public."user"(id);
 Z   ALTER TABLE ONLY public.role_users_user DROP CONSTRAINT "FK_a88fcb405b56bf2e2646e9d4797";
       public          myuser    false    3267    229    225            �           2606    41025 :   role_permissions_permission FK_b36cb2e04bc353ca4ede00d87b9    FK CONSTRAINT     �   ALTER TABLE ONLY public.role_permissions_permission
    ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE;
 f   ALTER TABLE ONLY public.role_permissions_permission DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9";
       public          myuser    false    228    3263    223            �           2606    41030 :   role_permissions_permission FK_bfbc9e263d4cea6d7a8c9eb3ad2    FK CONSTRAINT     �   ALTER TABLE ONLY public.role_permissions_permission
    ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES public.permission(id);
 f   ALTER TABLE ONLY public.role_permissions_permission DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2";
       public          myuser    false    228    221    3259            �           2606    41035 .   role_users_user FK_ed6edac7184b013d4bd58d60e54    FK CONSTRAINT     �   ALTER TABLE ONLY public.role_users_user
    ADD CONSTRAINT "FK_ed6edac7184b013d4bd58d60e54" FOREIGN KEY ("roleId") REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE;
 Z   ALTER TABLE ONLY public.role_users_user DROP CONSTRAINT "FK_ed6edac7184b013d4bd58d60e54";
       public          myuser    false    3263    229    223            �           2606    16413 4   role_permissions role_permissions_permission_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.role_permissions DROP CONSTRAINT role_permissions_permission_id_fkey;
       public          myuser    false    219    218    3255            �           2606    16408 .   role_permissions role_permissions_role_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.role_permissions DROP CONSTRAINT role_permissions_role_id_fkey;
       public          myuser    false    216    3251    219            u      x������ � �      {      x������ � �      r   #   x�3�,JML�2�,/�,I�2�LM�,����� h�      w      x�3�,-N-����� ��      s   .   x���  ��w3M[����뜱��d�7_X��8x��[�>��R      |      x������ � �      }      x������ � �      p   B   x�3�,-N-�2�LL����2�,H��0M8��R2SK����%��P�P!�9\	�X�+F��� W0I      y   ]   x�3�,-N-rH�H�-�I�K���T1JR14P��43�
0��L�3(�N*�40�HpK,ws6*I�*�r*,�*�2*57�JMu�M�H����� ���      z      x�3�4����� ]     