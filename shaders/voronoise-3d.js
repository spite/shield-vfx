// from https://www.shadertoy.com/view/4ddfWn

const voronoise3d = `
#define clamp01(x) clamp(x, 0.0, 1.0)

float Pow2(float x) {return x*x;}
float Pow3(float x) {return x*x*x;}
float Pow4(float x) {return Pow2(Pow2(x));}

float CheapHash(float v)
{
    return fract(sin(v) * 43758.5453) * 2.0 - 1.0;
}

float CheapHash(vec2 v)
{
	return CheapHash(v.y + v.x * 12.9898);
}

float CheapHash(vec3 v)
{
	return CheapHash(v.xy + v.z * vec2(3.354355, 7.23432));
}

float CheapHash(vec4 v)
{
	return CheapHash(v.xyz + v.w * vec3(5.08452, 1.3456, 9.235621));
}

float SqrLen(float v) {return v * v;}
float SqrLen(vec2  v) {return dot(v, v);}
float SqrLen(vec3  v) {return dot(v, v);}
float SqrLen(vec4  v) {return dot(v, v);}

float VoronoiseN3(vec3 x, vec3 cells)
{
	vec3 ix = floor(x);
	vec3 fx = x - ix;

    float res = 0.0;
    float accu_w = 0.0;
    
	for (float i = 0.0; i < 3.0; ++i)
	for (float j = 0.0; j < 3.0; ++j)
	for (float k = 0.0; k < 3.0; ++k)
	{
		vec3 v = vec3(i, j, k);
		vec3 c = v - 0.5;
		vec3 vp = v + ix;

        #if 0
        vp = mod(vp, cells);// mod(x, y) == x - y * floor(x/y)    
        vp = If(lessThan(vp, vec3(0.0)), cells + vp, vp);
        #endif
        
		float s0 = CheapHash(vp * 1.3287 + 0.1338);
		float s1 = CheapHash(vp * 0.9562 + 1.4267);
		float s2 = CheapHash(vp * 0.8422 + 1.0456);		
        float s3 = CheapHash(vp * 1.1045 + 0.9391);        
        float s4 = CheapHash(vp * 1.0909 + 0.3985);

		#if 0
		vec3 off = Sample_Sphere(s0, s1);
        #else
		vec3 off = normalize(vec3(s0, s1, s2));
		#endif
        
		c += off * 0.396;

		float l = SqrLen(fx - c);
		//l = sqrt(l * 0.5 + 0.5);// - 1.0;
        
        float w = clamp01(1.0 - l * 0.72);// 0.8? -> test empirically
        w = exp2(w*w * 16.0) - 1.0;
        //w = 1.0 / (exp2(l * 4.0) - 1.0*0.9);
        
        //w = pow(w, 5.0);
        //w = SCurveC1(w);
        //w *= w;
        //w *= w;
        //w *= w;
        
        #if 0
        {
            #if 1
            vec3 ox, oz;
            OrthonormalBasisRH(off, /*out:*/ ox, oz);
            vec2 off2 = AngToVec(s4 * Pi);

            off = ox * off.x + oz * off.y;
            #endif

            #if 1
            s3 = s3*1.0 + dot(off, fx - c)*1.0;
            #else
            s3 = s3*.0 + sin((dot(off, fx - c) + s4) * Pi*1.5);
            #endif
            //s3 *= 0.75;
        }
        #endif
        
        //s3 = s3 < 0. ? -1.0 : 1.0;
        //s3 = Pow3(s3);        
        //s3 = Pow3(s3);

        res += s3 * w;
        
        accu_w += w;
	}

	res = accu_w == 0.0 ? 0.0 : res / accu_w;

    //res+=0.2;
    //res*=10.0;
    //return res * 0.5 + 0.5 < 0.35 ? 0.0 : 1.0;
    //return isnan(res) ? 1.0 : 0.0;
    
	//return res;
    
    //return smoothstep(0., 0.05, pow(Pow2(res), 2.0)) * (abs(res));
    return 1.0 - smoothstep(0., 0.05, pow(Pow2(res), 2.0));
    //return 1.0 - Pow2(res) > 0.9 ? 1.0 : 0.0;
    ////return pow(1.0 - pow(abs(res), 8.0), 1024.0);
	return res * 0.5 + 0.5;
}
`;

export { voronoise3d };
