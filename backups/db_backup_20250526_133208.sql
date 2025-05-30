PGDMP                       }         
   mydatabase    16.9 (Debian 16.9-1.pgdg120+1)    16.9 (Debian 16.9-1.pgdg120+1)     0           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            1           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            2           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            3           1262    16384 
   mydatabase    DATABASE     u   CREATE DATABASE mydatabase WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE mydatabase;
                myuser    false            �            1259    16395    permissions    TABLE     f   CREATE TABLE public.permissions (
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
       public          myuser    false    218            4           0    0    permissions_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;
          public          myuser    false    217            �            1259    16403    role_permissions    TABLE     k   CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);
 $   DROP TABLE public.role_permissions;
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
       public          myuser    false    216            5           0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public          myuser    false    215            �           2604    16398    permissions id    DEFAULT     p   ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);
 =   ALTER TABLE public.permissions ALTER COLUMN id DROP DEFAULT;
       public          myuser    false    218    217    218            �           2604    16389    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public          myuser    false    216    215    216            ,          0    16395    permissions 
   TABLE DATA           /   COPY public.permissions (id, name) FROM stdin;
    public          myuser    false    218   �       -          0    16403    role_permissions 
   TABLE DATA           B   COPY public.role_permissions (role_id, permission_id) FROM stdin;
    public          myuser    false    219   *       *          0    16386    roles 
   TABLE DATA           )   COPY public.roles (id, name) FROM stdin;
    public          myuser    false    216   h       6           0    0    permissions_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.permissions_id_seq', 3, true);
          public          myuser    false    217            7           0    0    roles_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.roles_id_seq', 8, true);
          public          myuser    false    215            �           2606    16402     permissions permissions_name_key 
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
       public            myuser    false    216            �           2606    16413 4   role_permissions role_permissions_permission_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.role_permissions DROP CONSTRAINT role_permissions_permission_id_fkey;
       public          myuser    false    219    3221    218            �           2606    16408 .   role_permissions role_permissions_role_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.role_permissions DROP CONSTRAINT role_permissions_role_id_fkey;
       public          myuser    false    219    3217    216            ,   #   x�3�,JML�2�,/�,I�2�LM�,����� h�      -   .   x���  ��w3M[����뜱��d�7_X��8x��[�>��R      *   B   x�3�,-N-�2�LL����2�,H��0M8��R2SK����%��P�P!�9\	�X�+F��� W0I     